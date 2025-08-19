(async () => {
  const execSync = require('child_process').execSync;
  const fs = require("fs");
  const path = require("path");
  const YAML = require("yaml");
  const utils = require("../utils.js");
  const junk = await import("junk");

  // get command line arguments
  const args = process.argv.slice(2);

  // read config
  const config = utils.readConfig();
  const processedConfig = YAML.parse(
    utils.replacePlaceholders(YAML.stringify(config), config),
    {"schema": "yaml-1.1"} // required to load yes/no as boolean values
  );

  // apply maintenance mode
  const maintenanceModeHcceFileName = "maintenance-mode-hcce.yaml"
  const hcce = utils.readTemplate("", "hcce.yaml");
  const hcceYamlDocuments = YAML.parseAllDocuments(hcce);
  hcceYamlDocuments.forEach((doc, index) => {
    const jsDoc = doc.toJS();
    if (jsDoc?.kind === "Ingress") {
      if (!jsDoc.metadata.annotations) {
        jsDoc.metadata["annotations"] = {};
      }
      jsDoc.metadata.annotations["haproxy.org/request-redirect"] = `hubs-maintenance-mode.${processedConfig.HUB_DOMAIN}`
      hcceYamlDocuments[index] = new YAML.Document(jsDoc);
    }
  });
  const maintenanceModeHcce = `${hcceYamlDocuments.map(doc => YAML.stringify(doc, {"lineWidth": 0, "directives": false})).join('---\n')}`
  utils.writeOutputFile(maintenanceModeHcce, "", maintenanceModeHcceFileName);

  console.log("applying maintenance mode");
  console.log("");
  execSync(`kubectl delete deployment --all -n ${processedConfig.Namespace}`, {stdio: 'inherit'});
  execSync(`kubectl delete pods --all -n ${processedConfig.Namespace}`, {stdio: 'inherit'});
  execSync(`kubectl apply -f ${maintenanceModeHcceFileName}`, {stdio: 'inherit'});
  let pendingDeploymentNames = []
  while (true) {
    let deployments = JSON.parse(execSync(`kubectl get deployment -n ${config.Namespace} -o json`)).items;
    let pendingDeployments = deployments.filter(deployment => (deployment.status.readyReplicas ?? 0) < deployment.status.replicas);

    if (pendingDeployments.length) {
      currentPendingDeploymentNames = pendingDeployments.map(deployment => deployment.metadata.name)
      if (currentPendingDeploymentNames.toString() !== pendingDeploymentNames.toString()) {
        console.log(`waiting on ${currentPendingDeploymentNames.join(", ")}`);
        pendingDeploymentNames = currentPendingDeploymentNames;
      }
      // Wait for 1 second
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
    } else {
      console.log("maintenance mode applied")
      break;
    }
  }

  // get backup paths
  const rootDataBackupPath = path.join(process.cwd(), "data_backups");
  const backup_name = args[0] ? args[0] :
    fs.readdirSync(rootDataBackupPath)
    .filter(name => name.includes("data_backup"))
    .sort().at(-1);
  const dataBackupPath = path.join(rootDataBackupPath, backup_name);
  const reticulumStoragePath = path.join(dataBackupPath, "reticulum_storage_data");
  const reticulumStorageRelativePath = path.relative(process.cwd(), reticulumStoragePath);
  const pgDumpSQLPath = path.join(dataBackupPath, "pg_dump.sql");
  if (!fs.existsSync(dataBackupPath)) {
      console.error("the specified backup doesn't exist");
      process.exit(1);
    }

  // get pod names
  let reticulumPodName = execSync(`kubectl get pods -l=app=reticulum -n ${processedConfig.Namespace} --output jsonpath='{.items[0].metadata.name}'`);
  let pgsqlPodName = execSync(`kubectl get pods -l=app=pgsql -n ${processedConfig.Namespace} --output jsonpath='{.items[*].metadata.name}'`);
  // strip out the single quotes that Windows adds in
  reticulumPodName = reticulumPodName.toString().replaceAll("'", "");
  pgsqlPodName = pgsqlPodName.toString().replaceAll("'", "");

  if (!pgsqlPodName) {
    console.warn("pgsql pod not found");
  }

  console.log("");
  console.log("restoring backup");
  console.log("");

  // remove any OS helper files from the reticulum storage
  function remove_os_helper_files_recursive(base_path) {
      if (fs.statSync(base_path).isDirectory()) {
          let fs_object_names = fs.readdirSync(base_path);

          fs_object_names.forEach(fs_object_name => {
              let fs_object_path = path.join(base_path, fs_object_name);

              if (junk.isJunk(fs_object_name)) {
                  // delete unneeded OS helper files that may have been added to the backup by the user's OS.
                  fs.rmSync(fs_object_path, { recursive: true, force: true });
              } else {
                  remove_os_helper_files_recursive(fs_object_path);
              }
          });
      }
  }
  remove_os_helper_files_recursive(reticulumStoragePath);

  // upload reticulum storage
  // note: relative paths must be used for kubectl cp on windows due to this bug: https://github.com/kubernetes/kubernetes/issues/101985
  let fs_object_names = fs.readdirSync(reticulumStoragePath);
  fs_object_names.forEach(fs_object_name => {
    console.log(`restoring Reticulum '${fs_object_name}' folder`);
    execSync(`kubectl cp --retries=-1 ${path.join(reticulumStorageRelativePath, fs_object_name)} ${reticulumPodName}:/storage -c reticulum -n ${processedConfig.Namespace}`, { env: { ...process.env, KUBECTL_REMOTE_COMMAND_WEBSOCKETS: false } });
  });

  if (pgsqlPodName) {
  // upload and apply the dump of the pgsql database
  // note: relative paths must be used for kubectl cp on windows due to this bug: https://github.com/kubernetes/kubernetes/issues/101985
    const pgsqlInputPath = path.relative(process.cwd(), pgDumpSQLPath);
    console.log(`restoring database from ${pgsqlInputPath}`);
    execSync(`kubectl cp --retries=-1 ${pgsqlInputPath} ${pgsqlPodName}:/root/pg_dump.sql -n ${processedConfig.Namespace}`, { env: { ...process.env, KUBECTL_REMOTE_COMMAND_WEBSOCKETS: false } });
    execSync(`kubectl exec ${pgsqlPodName} -n ${processedConfig.Namespace} -- /bin/psql ${processedConfig.PGRST_DB_URI} -f /root/pg_dump.sql`);
    execSync(`kubectl exec ${pgsqlPodName} -n ${processedConfig.Namespace} -- /bin/rm /root/pg_dump.sql`);
  } else {
    console.warn('not restoring database');
  }

  // restart the Hubs instance so it doesn't error out when visited and maintenance mode is no longer applied
  fs.rmSync(path.join(process.cwd(), maintenanceModeHcceFileName));
  console.log("");
  console.log("restarting instance");
  execSync(`kubectl delete deployment --all -n ${processedConfig.Namespace}`, {stdio: 'inherit'});
  execSync(`kubectl delete pods --all -n ${processedConfig.Namespace}`, {stdio: 'inherit'});
  execSync(`npm run apply`, {stdio: 'inherit'});
})();

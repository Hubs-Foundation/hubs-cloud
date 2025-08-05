const execSync = require('child_process').execSync;
const fs = require("fs");
const path = require("path");
const YAML = require("yaml");
const utils = require("../utils");

// read config
const config = utils.readConfig();
const processedConfig = YAML.parse(
  utils.replacePlaceholders(YAML.stringify(config), config),
  {"schema": "yaml-1.1"} // required to load yes/no as boolean values
);

// get backup paths
const rootDataBackupPath = path.join(process.cwd(), "data_backups");
const dataBackupPath = path.join(rootDataBackupPath, `data_backup_${Date.now()}`);
const reticulumStoragePath = path.join(dataBackupPath, "reticulum_storage_data");
const pgDumpSQLPath = path.join(dataBackupPath, "pg_dump.sql");

// get pod names
let reticulumPodName = execSync(`kubectl get pods -l=app=reticulum -n ${processedConfig.Namespace} --output jsonpath='{.items[0].metadata.name}'`);
let pgsqlPodName = execSync(`kubectl get pods -l=app=pgsql -n ${processedConfig.Namespace} --output jsonpath='{.items[0].metadata.name}'`);
// strip out the single quotes that Windows adds in
reticulumPodName = reticulumPodName.toString().replaceAll("'", "");
pgsqlPodName = pgsqlPodName.toString().replaceAll("'", "");


// make backups folder (if needed)
if (!fs.existsSync(rootDataBackupPath)) {
    fs.mkdirSync(rootDataBackupPath);
  }

// download reticulum storage
// note: relative paths must be used for kubectl cp on windows due to this bug: https://github.com/kubernetes/kubernetes/issues/101985
execSync(`kubectl cp --retries=-1 ${reticulumPodName}:/storage ${path.relative(process.cwd(), reticulumStoragePath)} -n ${processedConfig.Namespace}`);

// create and download dump of pgsql database
// note: relative paths must be used for kubectl cp on windows due to this bug: https://github.com/kubernetes/kubernetes/issues/101985
execSync(`kubectl exec ${pgsqlPodName} -n ${processedConfig.Namespace} -- /bin/pg_dump -c ${processedConfig.PGRST_DB_URI} -f /root/pg_dump.sql`);
execSync(`kubectl cp --retries=-1 ${pgsqlPodName}:/root/pg_dump.sql ${path.relative(process.cwd(), pgDumpSQLPath)} -n ${processedConfig.Namespace}`);
execSync(`kubectl exec ${pgsqlPodName} -n ${processedConfig.Namespace} -- /bin/rm /root/pg_dump.sql`);

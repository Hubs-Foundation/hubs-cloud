const utils = require("../utils");
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);

main().catch(err => {
  if (err.stderr) {
    console.log(err.stdout)
    console.error(err.stderr);
  } else {
    console.error(err);
  }
});

async function main() {
  const { stdout, stderr } = await exec("kubectl apply -f hcce.yaml");
  console.error(stderr);
  console.log(stdout);

  const config = utils.readConfig();
  const cmdline = `kubectl -n ${config.Namespace} get deployment -o json`;
  const notReady = [];
  do {
    const { stdout, stderr } = await exec(cmdline);
      console.error(stderr);
      const output = JSON.parse(stdout);
      notReady.length = 0;
      for (const deployment of output.items) {
        if (deployment.status.readyReplicas < deployment.status.replicas) {
          notReady.push(deployment.metadata.name)
        }
      }
      if (notReady.length > 0) {
        console.log("waiting on", notReady.join(", "));
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
  } while (notReady.length > 0);
  console.log("all deployments ready");
}

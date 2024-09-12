const { spawn } = require('node:child_process');
const utils = require("../utils");
const util = require('node:util');
const execFile = util.promisify(require('node:child_process').execFile);

main().catch(err => {
  if (err.stderr) {
    console.error(err.stderr);
  } else {
    console.error(err);
  }
});

async function main() {
  await new Promise((resolve, reject) => {
    const child = spawn('kubectl', ['apply', '-f', 'hcce.yaml']);
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
    child.on('exit', resolve);
    child.on('error', reject);
  });

  const config = utils.readConfig();
  const cmd = 'kubectl';
  const args = ['-n', config.Namespace, 'get', 'deployment', '-o', 'json']
  const notReady = [];
  do {
    const { stdout, stderr } = await execFile(cmd, args);
      if (stderr) {
        console.error(stderr);
      }
      const output = JSON.parse(stdout);
      notReady.length = 0;
      for (const deployment of output.items) {
        if (deployment.status.readyReplicas < deployment.status.replicas ||
          deployment.status.updatedReplicas < deployment.status.replicas ||
          deployment.status.availableReplicas < deployment.status.replicas) {
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

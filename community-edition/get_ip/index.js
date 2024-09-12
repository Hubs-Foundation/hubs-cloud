const utils = require("../utils");
const { exec } = require('node:child_process');

const config = utils.readConfig();
const cmdline = `kubectl -n ${config.Namespace} get svc lb -o json`;
exec(cmdline, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  const output = JSON.parse(stdout);
  console.log("load balancer external IP address:", output.status.loadBalancer.ingress[0].ip);
});

const { spawnSync } = require("node:child_process");
const utils = require("../utils");
const { execFileSync } = require("node:child_process");

spawnSync("kubectl", ["apply", "-f", "hcce.yaml"], { stdio: "inherit" });

const config = utils.readConfig();
const cmd = "kubectl";
const args = ["-n", config.Namespace, "get", "deployment", "-o", "json"];
const notReady = [];
checkDeployments();

function checkDeployments() {
  const stdout = execFileSync(cmd, args);
  const output = JSON.parse(stdout);
  notReady.length = 0;
  for (const deployment of output.items) {
    if ((deployment.status.readyReplicas ?? 0) < deployment.status.replicas) {
      notReady.push(deployment.metadata.name);
    }
  }
  if (notReady.length > 0) {
    console.log("waiting on", notReady.join(", "));
    setTimeout(checkDeployments, 1000);
  } else {
    console.log("all deployments ready");
  }
}

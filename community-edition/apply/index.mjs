import { spawnSync, execFileSync } from "node:child_process";
import utils from "../utils.js";
import meow from "meow";

const cli = meow(
  `
apply — applies a Kubernetes template file to the cluster and polls until complete
Usage:

    npm run apply
	npm run apply input-values.yaml
    npm run apply input-values.yaml template.yaml
`,
  {
    importMeta: import.meta,
    flags: {},
    allowUnknownFlags: false,
  }
);
const templatePath = cli?.input?.[1] || "hcce.yaml";
console.log(`applying ${templatePath}`);
spawnSync("kubectl", ["apply", "-f", templatePath], { stdio: "inherit" });

const config = utils.readConfig(cli);
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

const utils = require("../utils");
const { spawnSync } = require("node:child_process");

const config = utils.readConfig();
const { stdout } = spawnSync(
  "kubectl",
  ["get", "svc", "--field-selector", "spec.type=LoadBalancer", "-A", "-o", "json"],
  { stdio: ["pipe", "pipe", "inherit"] }
);
const output = JSON.parse(stdout);
if (output.items.length === 0) {
  console.warn("can't determine external IP address: no load balancers in cluster");
  process.exit(1);
}
for (const item of output.items) {
  const ipAddr = item.status.loadBalancer?.ingress?.[0]?.ip;
  if (ipAddr) {
    console.log("load balancer external IP address:", ipAddr);
  } else {
    console.log("load balancer not running yet:", output.status.loadBalancer);
  }
}

const utils = require("../utils");
const { spawnSync } = require("node:child_process");

const config = utils.readConfig();
const { stdout } = spawnSync(
  "kubectl",
  ["-n", config.Namespace, "get", "svc", "lb", "-o", "json"],
  { stdio: ["pipe", "pipe", "inherit"] }
);
const output = JSON.parse(stdout);
const ipAddr = output.status.loadBalancer?.ingress?.[0]?.ip;
if (ipAddr) {
  console.log("load balancer external IP address:", ipAddr);
} else {
  console.log("load balancer not running yet:", output.status.loadBalancer);
}

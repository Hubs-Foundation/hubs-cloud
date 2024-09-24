const utils = require("../utils");
const { spawnSync } = require("node:child_process");

const config = utils.readConfig();
const { stdout } = spawnSync(
  "kubectl",
  ["-n", config.Namespace, "get", "svc", "lb", "-o", "json"],
  { stdio: ["pipe", "pipe", "inherit"] }
);
const output = JSON.parse(stdout);
console.log(
  "load balancer external IP address:",
  output.status.loadBalancer.ingress[0].ip
);

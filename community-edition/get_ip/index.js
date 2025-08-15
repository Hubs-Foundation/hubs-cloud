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
  const name = item.metadata.name;
  const namespace = item.metadata.namespace;
  const status = item.status;
  const addr = status?.loadBalancer?.ingress?.[0]?.ip || status?.loadBalancer?.ingress?.[0]?.hostname;
  if (addr) {
    console.log(`load balancer “${name}” in namespace “${namespace}” external address: ${addr}`);
  } else {
    console.log(`load balancer “${name}” in namespace “${namespace}” not running yet:`, status);
  }
}

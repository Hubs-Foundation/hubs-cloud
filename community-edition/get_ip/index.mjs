import utils from "../utils.js";
import { spawnSync } from "node:child_process";
import meow from 'meow';

const cli = meow(`
get-ip — retrieves the IP address of the load balancer for the configured input values
Usage:

    npm run get-ip
    npm run get-ip input-values.yaml
`,
  {
    importMeta: import.meta,
    flags: {},
    allowUnknownFlags: false,
  }
);
const config = utils.readConfig(cli);
const { stdout } = spawnSync(
  "kubectl",
  ["-n", config.Namespace, "get", "svc", "lb", "-o", "json"],
  { stdio: ["pipe", "pipe", "inherit"] }
);
const output = JSON.parse(stdout);
const ipAddr = output.status.loadBalancer?.ingress?.[0]?.ip;
if (ipAddr) {
  console.log(
    `load balancer for “${config.Namespace}” external IP address:`,
    ipAddr
  );
} else {
  console.log(
    `load balancer for “${config.Namespace}” not running yet:`,
    output.status.loadBalancer
  );
}

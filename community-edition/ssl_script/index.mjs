import { execSync } from "child_process"
import utils from "../utils.js";
import meow from 'meow';


function generate_ssl(config, template, url) {
  console.log(`Generating SSL certificate for: ${url}`);
  // Delete the certbotbot-http pod
  try {execSync(`kubectl delete pod certbotbot-http -n ${config.Namespace}`)} catch {
    console.log("certbotbot-http pod not present.  This is fine");
  }
  // Generate the cbb.yaml file for this domain/subdomain and apply it
  config.HUB_DOMAIN = url;
  const replacedContent = utils.replacePlaceholders(template, config);
  utils.writeOutputFile(replacedContent, "ssl_script", "cbb.yaml");
  try {execSync(`kubectl apply -f cbb.yaml`, {cwd: "ssl_script"})} catch (error) {
    console.error(`while executing kubectl apply -f cbb.yaml:`, error);
    process.exit(1);
  }
  // check the status of the SSL certificate generation
  while (true) {
    // Wait for 10 seconds
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10000);
    // Get the status of the certbotbot-http pod
    try {
      let output = execSync(`kubectl get pod certbotbot-http -n ${config.Namespace} --no-headers -o custom-columns=STATUS:.status.phase`);

      if (output.toString().trim() === "Running") {
        process.stdout.write(".");
      }
      else if (output.toString().trim() === "Succeeded") {
        console.log(":");
        try {
          output = execSync(`kubectl get secret cert-${url} -n ${config.Namespace}`);
          console.log(output.toString());
          return;
        } catch (error) {
          console.error(`while executing kubectl get secret cert-${url} -n ${config.Namespace}:`, error);
          process.exit(1);
        }
      }
      else {
        console.log(`bad pod status: ${output.toString().trim()}`)
        return;
      }
    } catch (error) {
      console.error(`while executing kubectl get pod certbotbot-http -n ${config.Namespace} --no-headers -o custom-columns=STATUS:.status.phase:`, error);
      process.exit(1);
    }
  }
}

const cli = meow(`
gen-ssl — generate TLS (SSL) certificates to support HTTPS
Usage:

    npm run gen-ssl
    npm run gen-ssl input-values.yaml
`,
  {
    importMeta: import.meta,
    flags: {},
    allowUnknownFlags: false,
  }
);


function main() {
  try {
    console.log("starting script");
    const config = utils.readConfig(cli);
    const template = utils.readTemplate("ssl_script", "cbb.yam");
    const rootHubDomain = config.HUB_DOMAIN;
    generate_ssl(config, template, rootHubDomain);
    generate_ssl(config, template, `assets.${rootHubDomain}`);
    generate_ssl(config, template, `stream.${rootHubDomain}`);
    generate_ssl(config, template, `cors.${rootHubDomain}`);
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

main();

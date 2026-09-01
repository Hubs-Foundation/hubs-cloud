const fs = require("fs");
const { execSync } = require("child_process");

// Read hcce.yaml
const yaml = fs.readFileSync("hcce.yaml", "utf8");

// Extract HUB_DOMAIN
const match = yaml.match(/HUB_DOMAIN:\s*"?([^"\n]+)"?/);
if (!match) {
  console.error("❌ Could not find HUB_DOMAIN in hcce.yaml");
  process.exit(1);
}

const baseDomain = match[1].trim();
const domains = [baseDomain, `www.${baseDomain}`];

console.log(`🌐 Checking domains: ${domains.join(", ")}`);

let shouldRenew = false;

domains.forEach(domain => {
  try {
    const cmd = `echo | openssl s_client -servername ${domain} -connect ${domain}:443 2>/dev/null | openssl x509 -noout -enddate`;
    const output = execSync(cmd).toString();

    const exp = output.split("=")[1].trim();
    const expDate = new Date(exp);
    const now = new Date();
    const diff = Math.floor((expDate - now) / (1000 * 60 * 60 * 24));

    console.log(`\n🔹 ${domain}`);
    console.log(`   📅 Expires: ${exp}`);
    console.log(`   ⏳ Days left: ${diff}`);

    if (diff < 20) {
      console.log(`   ⚠️ Needs renewal soon`);
      shouldRenew = true;
    }

  } catch (err) {
    console.log(`\n🔹 ${domain}`);
    console.log(`   ❌ Failed to check certificate`);
    shouldRenew = true;
  }
});

if (shouldRenew) {
  console.log("\n🚨 One or more certs need attention");
  process.exit(2);
} else {
  console.log("\n✅ All certs look good");
}

const fs = require("fs");
const { execSync } = require("child_process");

// ---- FLAGS ----
const force = process.argv.includes("--force");

// ---- STEP 1: Get domain from hcce.yaml ----
const yaml = fs.readFileSync("hcce.yaml", "utf8");
const match = yaml.match(/HUB_DOMAIN:\s*"?([^"\n]+)"?/);

if (!match) {
  console.error("❌ Could not find HUB_DOMAIN");
  process.exit(1);
}

const baseDomain = match[1].trim();
const domains = [baseDomain, `www.${baseDomain}`];

console.log(`🌐 Checking: ${domains.join(", ")}`);
if (force) console.log("⚠️ FORCE MODE ENABLED");

// ---- STEP 2: Check expiration ----
let shouldRenew = false;

domains.forEach(domain => {
  try {
    const cmd = `echo | openssl s_client -servername ${domain} -connect ${domain}:443 2>/dev/null | openssl x509 -noout -enddate`;
    const output = execSync(cmd).toString();

    const exp = output.split("=")[1].trim();
    const diff = Math.floor((new Date(exp) - new Date()) / (1000 * 60 * 60 * 24));

    console.log(`🔹 ${domain}: ${diff} days`);

    if (diff < 20 || force) {
      shouldRenew = true;
    }

  } catch (e) {
    console.log(`❌ Failed check for ${domain}`);
    shouldRenew = true;
  }
});

// ---- STEP 3: Exit if not needed ----
if (!shouldRenew) {
  console.log("✅ Certs healthy. Skipping renewal.");
  process.exit(0);
}

console.log("🚨 Proceeding with SSL renewal...");

// ---- STEP 4: Enable default cert ----
execSync(
  `sed -i.bak 's/#- - - default-ssl-certificate+hcce\\/cert-hcce/- - - default-ssl-certificate+hcce\\/cert-hcce/' hcce.yaml`
);
execSync(`kubectl apply -f hcce.yaml`, { stdio: "inherit" });

// ---- STEP 5: Generate cert ----
execSync(`npm run gen-ssl`, { stdio: "inherit" });

// ---- STEP 6: Disable default cert ----
execSync(
  `sed -i.bak 's/- - - default-ssl-certificate+hcce\\/cert-hcce/#- - - default-ssl-certificate+hcce\\/cert-hcce/' hcce.yaml`
);
execSync(`kubectl apply -f hcce.yaml`, { stdio: "inherit" });

// ---- STEP 7: Restart pods ----
execSync(`kubectl rollout restart deployment -n hcce`, { stdio: "inherit" });

console.log("⏳ Waiting 20s...");
execSync(`sleep 20`);

// ---- STEP 8: Verify ----
domains.forEach(domain => {
  try {
    const cmd = `echo | openssl s_client -servername ${domain} -connect ${domain}:443 2>/dev/null | openssl x509 -noout -issuer -enddate`;
    const output = execSync(cmd).toString();

    console.log(`\n🔍 ${domain}`);
    console.log(output);

  } catch (e) {
    console.log(`❌ Verification failed for ${domain}`);
  }
});

console.log("\n✅ Done.");

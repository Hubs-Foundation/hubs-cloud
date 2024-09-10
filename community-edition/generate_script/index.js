const crypto = require("crypto");
const forge = require("node-forge");
const path = require("path");
const yaml = require("js-yaml");
const pemJwk = require("pem-jwk");
const utils = require("../utils");

// Generate a private key and public key
function generateKeys() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  return { publicKey, privateKey };
}

// Generate a self-signed certificate
function generateCertificate(hub_domain) {
  // Create a new certificate
  const { publicKey, privateKey } = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = publicKey;

  // Set certificate attributes
  cert.serialNumber = "01";
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

  const attrs = [
    {
      name: "commonName",
      value: hub_domain,
    }
  ];
  cert.setSubject(attrs);
  cert.setIssuer(attrs);

  // Sign the certificate with its own private key
  cert.sign(privateKey, forge.md.sha256.create());

  // Convert the certificate and private key to PEM format
  const pemCert = forge.pki.certificateToPem(cert);
  const pemPrivateKey = forge.pki.privateKeyToPem(privateKey);

  return { pemCert, pemPrivateKey };
}

// Function to convert PEM to JWK
function convertPemToJwk(publicKey) {
  const jwk = pemJwk.pem2jwk(publicKey);
  return JSON.stringify(jwk);
}

// Main function to handle the script
function main() {
  try {
    const config = utils.readConfig();
    const processedConfig = yaml.load(
      utils.replacePlaceholders(yaml.dump(config), config)
    );

    // Generate keys and certificate
    const { privateKey, publicKey } = generateKeys();
    const { pemCert, pemPrivateKey } = generateCertificate(config.HUB_DOMAIN);

    processedConfig.PGRST_JWT_SECRET = convertPemToJwk(publicKey);
    processedConfig.PERMS_KEY = privateKey.replace(/\n/g, "\\\\n");
    processedConfig.initCert = Buffer.from(pemCert).toString('base64').replace(/\n/g, "");
    processedConfig.initKey = Buffer.from(pemPrivateKey).toString('base64').replace(/\n/g, "");

    const template = utils.readTemplate("/generate_script", "hcce.yam");
    const replacedContent = utils.replacePlaceholders(template, processedConfig);
    utils.writeOutputFile(replacedContent, "", "hcce.yaml");
    console.log("Environment variables set and keys generated successfully.");
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

main();

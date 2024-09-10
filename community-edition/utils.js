const path = require("path");
const fs = require("fs");
const YAML = require("yaml");

module.exports = {
  // Function to read and parse YAML config file
  readConfig: function readConfig() {
    try {
      const configPath = path.join(process.cwd(), "input-values.yaml");
      const fileContents = fs.readFileSync(configPath, "utf8");
      return YAML.parse(fileContents);
    } catch (error) {
      console.error("Error reading config file:", error);
      throw error;
    }
  },

  // Function to read template files
  readTemplate: function readTemplate(folder, file) {
    try {
      const templatePath = path.join(process.cwd(), folder, file);
      const fileContents = fs.readFileSync(templatePath, "utf8");
      return fileContents;
    } catch (error) {
      console.error("Error reading template file:", error);
      throw error;
    }
  },

  // Function to write the YAML output file
  writeOutputFile: function writeOutputFile(content, folder, filepath) {
    try {
      const outputPath = path.join(process.cwd(), folder, filepath);
      fs.writeFileSync(outputPath, content, "utf8");
      console.log(`${filepath} file generated successfully.`);
    } catch (error) {
      console.error("Error writing output file:", error);
      throw error;
    }
  },

  // Function to replace placeholders in template with config values
  replacePlaceholders: function replacePlaceholders(template, config) {
    return template.replace(/\$(\w+)/g, (match, p1) => {
      return config[p1] !== undefined ? config[p1] : match;
    });
  }
}

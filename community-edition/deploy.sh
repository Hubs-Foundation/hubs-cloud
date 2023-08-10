#!/bin/bash

# Read user inputs
declare -A user_inputs
prompts=("namespace" "HubDomain" "DBpass" "SmtpServer" "SmtpPort" "SmtpUser" "SmtpPass" "UserEmail" "GuardianKey" "PhxKey" "SKETCHFAB_API_KEY" "TENOR_API_KEY")

for prompt in "${prompts[@]}"; do
    read -p "Enter $prompt: " input
    user_inputs["$prompt"]=$input
done

# Create private and public keys.
openssl rsa -pubout -in private_key.pem -out public_key.pem

base64_private_key=$(cat private_key.pem | base64 -w 0)
base64_public_key=$(cat public_key.pem | base64 -w 0)

perms_key="$base64_private_key"

jwk="$base64_public_key" 

# Update placeholders in the YAML file
yaml_file="chart.yaml"
temp_file="temp_chart.yaml"

awk -v perms_key="$perms_key" '{ 
    gsub("{{PermsKey}}", perms_key);
    print;
}' "$yaml_file" > "$temp_file" && mv "$temp_file" "$yaml_file"

awk -v jwk="$jwk" '{ 
    gsub("{{JWK}}", jwk);
    print;
}' "$yaml_file" > "$temp_file" && mv "$temp_file" "$yaml_file"

for prompt in "${prompts[@]}"; do
    value="${user_inputs[$prompt]}"
    sed -i "s/{{$prompt}}/$value/g" "$yaml_file"
done
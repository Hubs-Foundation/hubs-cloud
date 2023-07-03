#!/bin/bash

read -p "Enter namespace: " namespace
read -p "Enter HubDomain: " hub_domain
read -p "Enter DBpass: " db_pass
read -p "Enter SmtpServer: " smtp_server
read -p "Enter SmtpPort: " smtp_port
read -p "Enter SmtpUser: " smtp_user
read -p "Enter SmtpPass: " smtp_pass
read -p "Enter UserEmail: " user_email
read -p "Enter JWK: " jwk
read -p "Enter GuardianKey: " guardian_key
read -p "Enter PhxKey: " phx_key
read -p "Enter SKETCHFAB_API_KEY: " sketchfab_api_key
read -p "Enter TENOR_API_KEY: " tenor_api_key
read -p "Enter PSQL: " psql

yaml_file="chart.yaml"

# Update the placeholders in the YAML file using sed
awk -v ns="$namespace" \
    -v hd="$hub_domain" \
    -v dbp="$db_pass" \
    -v pk="$perms_key" \
    -v ss="$smtp_server" \
    -v sp="$smtp_port" \
    -v su="$smtp_user" \
    -v spw="$smtp_pass" \
    -v ue="$user_email" \
    -v jw="$jwk" \
    -v gk="$guardian_key" \
    -v ph="$phx_key" \
    -v sk="$sketchfab_api_key" \
    -v ta="$tenor_api_key" \
    -v psql="$psql" \
    '{
        gsub("{{Namespace}}", ns);
        gsub("{{HubDomain}}", hd);
        gsub("{{DBpass}}", dbp);
        gsub("{{PermsKey}}", pk);
        gsub("{{SmtpServer}}", ss);
        gsub("{{SmtpPort}}", sp);
        gsub("{{SmtpUser}}", su);
        gsub("{{SmtpPass}}", spw);
        gsub("{{UserEmail}}", ue);
        gsub("{{JWK}}", jw);
        gsub("{{GuardianKey}}", gk);
        gsub("{{PhxKey}}", ph);
        gsub("{{SKETCHFAB_API_KEY}}", sk);
        gsub("{{TENOR_API_KEY}}", ta);
        gsub("{{PSQL}}", psql);
        print;
    }' "$yaml_file" > tmpfile && mv tmpfile "$yaml_file"
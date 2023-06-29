from jinja2 import Template
import yaml


# Define the YAML template
yaml_template = """
apiVersion: v1
kind: Secret
metadata:
  name: configs
  namespace: {{ Namespace }}
stringData:
  HUB_DOMAIN: {{ HubDomain }}
  DB_USER: postgres
  DB_PASS: {{ DBpass }}
  DB_NAME: retdb
  DB_HOST: pgbouncer
  DB_HOST_T: pgbouncer-t
  PERMS_KEY: {{ PermsKey }}
  SMTP_SERVER: {{ SmtpServer }}
  SMTP_PORT: "{{ SmtpPort }}"
  SMTP_USER: {{ SmtpUser }}
  SMTP_PASS: {{ SmtpPass }}
  ADM_EMAIL: {{ UserEmail }}
  PGRST_DB_URI: postgres://postgres:{{ DBpass }}@pgbouncer/retdb
  PGRST_JWT_SECRET: "{{ JWK }}"
  GUARDIAN_KEY: {{ GuardianKey }}
  PHX_KEY: {{ PhxKey }}
  SKETCHFAB_API_KEY: {{ SKETCHFAB_API_KEY }}
  TENOR_API_KEY: {{ TENOR_API_KEY }}
  PSQL: "postgres://postgres:{{ DBpass }}@pgbouncer/ret_dev"
"""

# Define the values to replace the placeholders
values = {}
values['Namespace'] = input("Enter the namespace: ")
values['HubDomain'] = input("Enter the hub domain: ")
values['DBpass'] = input("Enter the DB password: ")
values['PermsKey'] = input("Enter the perms key: ")
values['SmtpServer'] = input("Enter the SMTP server: ")
values['SmtpPort'] = input("Enter the SMTP port: ")
values['SmtpUser'] = input("Enter the SMTP user: ")
values['SmtpPass'] = input("Enter the SMTP password: ")
values['UserEmail'] = input("Enter the user email: ")
values['JWK'] = input("Enter the JWK: ")
values['GuardianKey'] = input("Enter the Guardian key: ")
values['PhxKey'] = input("Enter the PHX key: ")
values['SKETCHFAB_API_KEY'] = input("Enter the Sketchfab API key: ")
values['TENOR_API_KEY'] = input("Enter the Tenor API key: ")
# Create a Jinja2 template from the YAML template
template = Template(yaml_template)

# Render the template with the provided values
rendered_yaml = template.render(values)

# Process the rendered YAML
data = yaml.safe_load(rendered_yaml)

print(data)

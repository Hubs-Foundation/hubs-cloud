from debian:bullseye-slim

run apt-get update && apt-get -y install curl nginx certbot python3-certbot-nginx tree jq
run curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl
run chmod +x ./kubectl && mv ./kubectl /usr/local/bin


copy entrypoint.sh entrypoint.sh
entrypoint bash entrypoint.sh http

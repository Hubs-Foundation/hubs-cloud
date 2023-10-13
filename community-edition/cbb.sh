#!/bin/bash

export ADM_EMAIL="gtan@mozilla.com"

export Namespace="hcce"
export HUB_DOMAIN="hctest3.net"

### initial cert
openssl req -x509 -newkey rsa:2048 -sha256 -days 15 -nodes -keyout key.pem -out cert.pem -subj '/CN='$HUB_DOMAIN
export initCert=$(base64 -i cert.pem)
export initKey=$(base64 -i key.pem)


envsubst < "cbb.yam" > "cbb.yaml"connect&& kubectl apply -f cbb.yaml
read -p "Press enter to continue"

export HUB_DOMAIN="assets.$HUB_DOMAIN"
envsubst < "cbb.yam" > "cbb.yaml"connect&& kubectl apply -f cbb.yaml
read -p "Press enter to continue"

export HUB_DOMAIN="stream.$HUB_DOMAIN"
envsubst < "cbb.yam" > "cbb.yaml"connect&& kubectl apply -f cbb.yaml
read -p "Press enter to continue"

export HUB_DOMAIN="cors.$HUB_DOMAIN"
envsubst < "cbb.yam" > "cbb.yaml"connect&& kubectl apply -f cbb.yaml

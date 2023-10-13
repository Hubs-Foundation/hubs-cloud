#!/bin/bash

export ADM_EMAIL="gtan@mozilla.com"

export Namespace="hcce"

### initial cert
openssl req -x509 -newkey rsa:2048 -sha256 -days 15 -nodes -keyout key.pem -out cert.pem -subj '/CN='$HUB_DOMAIN
export initCert=$(base64 -i cert.pem)
export initKey=$(base64 -i key.pem)


export HUB_DOMAIN="hctest3.net"
envsubst < "cbb.yam" > "cbb.yaml" && bash render_cbb.sh && kubectl apply -f cbb.yaml
read -p "Press enter to continue"

export HUB_DOMAIN="assets.hctest3.net"
envsubst < "cbb.yam" > "cbb.yaml" && bash render_cbb.sh && kubectl apply -f cbb.yaml
read -p "Press enter to continue"

export HUB_DOMAIN="stream.hctest3.net"
envsubst < "cbb.yam" > "cbb.yaml" && bash render_cbb.sh && kubectl apply -f cbb.yaml
read -p "Press enter to continue"

export HUB_DOMAIN="cors.hctest3.net"
envsubst < "cbb.yam" > "cbb.yaml" && bash render_cbb.sh && kubectl apply -f cbb.yaml

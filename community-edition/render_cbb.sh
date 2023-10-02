#!/bin/bash

export ADM_EMAIL="gtan@mozilla.com"
export HUB_DOMAIN="hctest3.net"

export Namespace="hcce"

### initial cert
openssl req -x509 -newkey rsa:2048 -sha256 -days 15 -nodes -keyout key.pem -out cert.pem -subj '/CN='$HUB_DOMAIN
export initCert=$(base64 cert.pem -w 0)
export initKey=$(base64 key.pem -w 0)

envsubst < "cbb.yam" > "cbb.yaml"

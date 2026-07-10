ROOT_PREFIX=/etc/letsencrypt
CERT_PREFIX=$ROOT_PREFIX/live

DOMAIN=dev.xrhub.org

# Get certificates - put your Cloudflare API token in cloudflare.ini
sudo certbot certonly --dns-cloudflare --dns-cloudflare-propagation-seconds 30  --dns-cloudflare-credentials ./cloudflare.ini  -d $DOMAIN -d assets.$DOMAIN -d cors.$DOMAIN -d stream.$DOMAIN

# TODO: INSECURE !!!
sudo chown -R $USER:$USER ${ROOT_PREFIX}
sudo chmod a+gr ${ROOT_PREFIX}

# Create secrets
kubectl delete secret cert-$DOMAIN -n hcce
kubectl delete secret cert-assets.$DOMAIN -n hcce
kubectl delete secret cert-cors.$DOMAIN -n hcce
kubectl delete secret cert-stream.$DOMAIN -n hcce

kubectl create secret tls cert-$DOMAIN --cert $CERT_PREFIX/$DOMAIN/fullchain.pem --key $CERT_PREFIX/${DOMAIN}/privkey.pem -n hcce
kubectl create secret tls cert-assets.$DOMAIN --cert $CERT_PREFIX/$DOMAIN/fullchain.pem --key $CERT_PREFIX/$DOMAIN/privkey.pem -n hcce
kubectl create secret tls cert-cors.$DOMAIN --cert $CERT_PREFIX/$DOMAIN/fullchain.pem --key $CERT_PREFIX/$DOMAIN/privkey.pem -n hcce
kubectl create secret tls cert-stream.$DOMAIN --cert $CERT_PREFIX/$DOMAIN/fullchain.pem --key $CERT_PREFIX/$DOMAIN/privkey.pem -n hcce


function need_new_cert(){
  echo -e "\n checking if we need_new_cert"
  kubectl -n $NAMESPACE get secret
  # if kubectl -n $NAMESPACE get secret $CERT_NAME -o=go-template='{{index .data "tls.crt"}}' | base64 -d > tls.crt; then return 0; fi
  kubectl -n $NAMESPACE get secret $CERT_NAME -o=go-template='{{index .data "tls.crt"}}' | base64 -d > tls.crt;
  ls -lha tls.crt
  sub=$(openssl x509 -noout -subject -in tls.crt)
  echo "cert sub: $sub"
  if ! echo $sub | grep -q "$DOMAIN"; then echo "  bad cert sub ($sub)-- need new cert for $DOMAIN"; return 0; fi
  # 3888000 sec == 45 days
  chk=$(openssl x509 -checkend 3888000 -noout -in tls.crt);
  echo $chk
  if [[ $chk == *"will expire"* ]]; then echo "expiring -- need new cert";return 0; else return 1; fi
}

function get_new_cert_dns(){
  echo -e "\n get_new_cert_dns with DOMAIN=${DOMAIN}, EMAIL=$CERTBOT_EMAIL"
  # certbot certonly --non-interactive --agree-tos -m $CERTBOT_EMAIL \
  certbot certonly --non-interactive --agree-tos --register-unsafely-without-email \
      --dns-$CHALLENGE --dns-$CHALLENGE-propagation-seconds 300 \
      --debug-challenges \
      -d $DOMAIN -d \*.$DOMAIN -d \*.stream.$DOMAIN -d \*.assets.$DOMAIN -d \*.cors.$DOMAIN\
      -d $HUB_DOMAIN -d \*.$HUB_DOMAIN -d \*.stream.$HUB_DOMAIN -d \*.assets.$HUB_DOMAIN -d \*.cors.$HUB_DOMAIN
}

function get_new_cert_http(){
  echo -e "\n get_new_cert_http -- requires $DOMAIN/.well-known/acme-challenge* routed into this pod"

  # certbot certonly --non-interactive --agree-tos -m $CERTBOT_EMAIL --preferred-challenges http --nginx -d $DOMAIN
  echo "deploy certbot-http ingress and service for http challenge"
  CERTBOTING=$(cat <<EOF
apiVersion: v1
kind: Service
metadata:
  name: certbotbot-http
  namespace: ${NAMESPACE}
spec:
  type: ClusterIP
  selector:
    app: certbotbot-http
  ports:
  - port: 80
    targetPort: 80
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: certbotbot-http
  namespace: ${NAMESPACE}
  annotations:
    kubernetes.io/ingress.class: haproxy
spec:
  rules:
  - host: ${DOMAIN}
    http:
      paths:
      - path: /.well-known/acme-challenge
        pathType: ImplementationSpecific
        backend:
          service:
            name: certbotbot-http
            port: 
              number: 80
EOF
)
  echo "${CERTBOTING}"|kubectl apply -f -

  echo "start nginx and wait $INGRESS_WAIT sec for ingress to pick up the pod" && nginx && sleep $INGRESS_WAIT
  
  echo "requesting cert"
  retries=10
  while (( retries > 0 )) && ! certbot certonly --non-interactive --agree-tos --register-unsafely-without-email --preferred-challenges http --nginx -d $DOMAIN
  do
    sleep 90
    retries=$(( retries - 1 ))
    echo "requesting cert -- retrying -- retries left: $retries"
  done


  echo "destroy certbot-http ingress and service for http challenge"
  echo "${CERTBOTING}"|kubectl delete -f -
}

function get_kubectl(){
  # echo "getting kubectl"
  # curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl
  # chmod +x ./kubectl && mv ./kubectl /usr/local/bin

  echo -e "\n making in-cluster config for kubectl"
  kubectl config set-cluster the-cluster --server="https://${KUBERNETES_SERVICE_HOST}:${KUBERNETES_SERVICE_PORT}" --certificate-authority=/var/run/secrets/kubernetes.io/serviceaccount/ca.crt
  kubectl config set-credentials pod-token --token="$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)"
  kubectl config set-context pod-context --cluster=the-cluster --user=pod-token
  kubectl config use-context pod-context
  sleep 5
}

function save_cert(){
  name=$1
  ns=$2
  echo -e "\n saving cert: <$name> to namespace: <$ns>"
  kubectl -n $ns create secret tls $name \
      --cert=/etc/letsencrypt/live/${DOMAIN}/fullchain.pem \
      --key=/etc/letsencrypt/live/${DOMAIN}/privkey.pem \
      --save-config --dry-run=client -o yaml | kubectl apply -f -
  echo -e "\n cert: "
  kubectl -n $ns describe secret $name
  # kubectl -n $ns get secret $name -o yaml
}

function err_exit(){
  echo -e "\n\n [ERROR],[certbotbot], wtb manual help pls, pod's hanging for 100 hr"
  sleep 360000
  exit 1
}

### preps
export CHALLENGE=$1
echo $GCP_SA_KEY > GCP_SA_KEY.json
chmod 600 GCP_SA_KEY.json
export GOOGLE_APPLICATION_CREDENTIALS="GCP_SA_KEY.json"
if [ -z $NAMESPACE ]; then echo "namespace unspecified, defaulting to <ingress>" && export NAMESPACE="ingress"; fi
if [ -z $CERT_NAME ]; then echo "CERT_NAME unspecified, defaulting to <letsencrypt-$CHALLENGE>" && export CERT_NAME="letsencrypt-$CHALLENGE"; fi
echo "NAMESPACE=$NAMESPACE"
echo "DOMAIN=$DOMAIN"
echo "HUB_DOMAIN=$HUB_DOMAIN"
echo "CHALLENGE=$CHALLENGE"
echo "CERTBOT_EMAIL=$CERTBOT_EMAIL"
echo "CERT_NAME=$CERT_NAME"
echo "CP_TO_NS=$CP_TO_NS"
echo "LETSENCRYPT_ACCOUNT=$LETSENCRYPT_ACCOUNT"
if [ -z $INGRESS_WAIT ]; then INGRESS_WAIT="30"; fi

if ! [ -z $LETSENCRYPT_ACCOUNT ]; then 
  acctDir="/etc/letsencrypt/accounts/acme-v02.api.letsencrypt.org/directory/"
  mkdir -p $acctDir
  echo $LETSENCRYPT_ACCOUNT | base64 -d > acct.tar.gz && tar -xf acct.tar.gz -C $acctDir
  tree $acctDir
fi

### steps
get_kubectl
# kubectl -n $NAMESPACE patch cronjob certbotbot -p '{"spec":{"schedule": "0 0 */13 * *"}}'
# if [ "$?" -ne 0 ]; then echo "ERROR -- can't patch cronjob, wtb rbac permision fixes"; sleep 3600; exit 1; fi

if ! need_new_cert; then echo "good cert => exit"; sleep 3; exit 0; fi

echo "getting new cert"
if [ "$CHALLENGE" = "http" ]; then
  get_new_cert_http
else
  get_new_cert_dns
fi

if [ "$?" -ne 0 ]; then echo "[ERROR] failed to get new cert"; err_exit; fi

echo "saving new cert"
if ! save_cert $CERT_NAME $NAMESPACE; then echo "[ERROR] failed to save cert"; err_exit; fi
for ns in ${CP_TO_NS//,/ }; do save_cert $CERT_NAME $ns; done

# if [ "$NAMESPACE" == "ingress" ]; then kubectl -n $NAMESPACE rollout restart deployment haproxy; fi

if [ -z $LETSENCRYPT_ACCOUNT ]; then 
  cd /etc/letsencrypt/accounts/acme*/directory/ && tar -czvf acct.tar.gz .
  acct=$(cat acct.tar.gz|base64)
  echo "reporting new letsencrypt account to orch: $acct"
  curl -X POST -d "$acct" http://turkeyorch.turkey-services:888/letsencrypt-account-collect
fi

if ! [[ $? ]]; then echo "[ERROR],[certbotbot], wtb manual help pls"; err_exit; fi

# letsencrypt_acct=$(cat /etc/letsencrypt/accounts/acme*/directory/*/regr.json | jq '.uri')
sleep 1

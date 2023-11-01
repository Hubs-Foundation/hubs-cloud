
### make infra
export STACK_NAME="hccetest36"
export AWS_REGION="us-east-2"
export HUB_DOMAIN="hctest2.net"
export ADM_EMAIL="gtan@mozilla.com"
export Namespace=$STACK_NAME

aws cloudformation create-stack --stack-name $STACK_NAME --template-body file://./cf.yaml --capabilities CAPABILITY_IAM

t0=$(date +%s)
FINAL_STATES=("CREATE_COMPLETE" "ROLLBACK_COMPLETE" "DELETE_COMPLETE" "UPDATE_COMPLETE" "UPDATE_ROLLBACK_COMPLETE")
while true; do
    # Get the current stack status
    STATUS=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].StackStatus' --output text)
    # Check if the status is in the list of final states
    t1=$(date +%s)
    if [[ " ${FINAL_STATES[@]} " =~ " ${STATUS} " ]]; then
        echo "[$((t1 - t0)) sec]Stack reached final state: $STATUS"
        break
    else
        echo -ne "[$((t1 - t0)) sec]stack is: $STATUS"\\r
        sleep 10
    fi
done

OUTPUTS=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs[*]')
echo $OUTPUTS

### prepare params
NUM_OUTPUTS=$(echo $OUTPUTS | jq length)
for (( i=0; i<$NUM_OUTPUTS; i++ )); do
    KEY=$(echo $OUTPUTS | jq -r ".[$i].OutputKey")
    VALUE=$(echo $OUTPUTS | jq -r ".[$i].OutputValue")
    VAR_NAME=$(echo $KEY | tr '-' '_')
    export $VAR_NAME=$VALUE
    echo "Exported $VAR_NAME=$VALUE"
done

export DB_PASS=$DBpass
export DB_HOST=$DBhost
export SMTP_SERVER=email-smtp.$AWS_REGION.amazonaws.com
export SMTP_PORT="587"
export SMTP_USER=$SMTPuser

IAMSECRET="$SmtpUserSecret";
MSG="SendRawEmail";
VerInBytes="2";
VerInBytes=$(printf \\$(printf '%03o' "$VerInBytes"));
SignInBytes=$(echo -n "$MSG"|openssl dgst -sha256 -hmac "$IAMSECRET" -binary);
SignAndVer=""$VerInBytes""$SignInBytes"";
export SMTP_PASS=$(echo -n "$SignAndVer"|base64)

### deploy
aws eks update-kubeconfig --name $EKSname
cd ..
bash render_hcce.sh
kubectl apply -f hcce.yaml
### use efs for reticulum's /storage
kubectl -n $Namespace patch deployment reticulum --type strategic --patch "$(cat << EOF
spec:
  template:
    spec:
      volumes:
      - name: storage-volume
        nfs:
          server: ${EFSid}.efs.$REGION.amazonaws.com
          path: /
EOF
)"
### report entrypoint
entrypoint=$(kubectl -n $Namespace get svc lb -o=jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "entrypoint: $entrypoint"


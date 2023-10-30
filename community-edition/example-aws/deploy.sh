
### make infra

STACK_NAME="hcce-test-25"
aws cloudformation create-stack --stack-name $STACK_NAME --template-body file://./cf.yaml --capabilities CAPABILITY_IAM

FINAL_STATES=("CREATE_COMPLETE" "ROLLBACK_COMPLETE" "DELETE_COMPLETE" "UPDATE_COMPLETE" "UPDATE_ROLLBACK_COMPLETE")
while true; do
    # Get the current stack status
    STATUS=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].StackStatus' --output text)
    # Check if the status is in the list of final states
    if [[ " ${FINAL_STATES[@]} " =~ " ${STATUS} " ]]; then
        echo "Stack reached final state: $STATUS"
        break
    else
        echo "stack is: $STATUS. checking again in 30 seconds"
        sleep 30
    fi
done
OUTPUTS=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs[*]')
echo $OUTPUTS > cf_outputs.json

### prepare params
OUTPUTS=$(cat cf_outputs.json)
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
export SMTP_SERVER=email-smtp.$(aws configure get region).amazonaws.com
export SMTP_PORT="587"
export SMTPuser=$SMTPuser
export SMTP_PASS=$(echo -n "$SmtpUserSecret" | openssl dgst -sha256 -hmac 'AWS4SES' -binary | openssl enc -base64)

### deploy
aws eks update-kubeconfig --name $EKSname
cd ..
bash render_hcce.sh





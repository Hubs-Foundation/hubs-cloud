#!/bin/bash
  
 



 
 # Generate a PKCS1 private key
  openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048

 # Extract the public key from the private key
  openssl rsa -pubout -in private_key.pem -out public_key.pem

  PermsKey=private_key.pem

 # Encode the public key as JWK
  jwk=$(openssl rsa -pubin -in public_key.pem -outform der | openssl dgst -binary -sha256 | base64)
 
 # Replace all double quotes with escaped double quotes
  jwk="${jwk//\"/\\\"}"
  echo $jwk 



 # inputs varibles for template. 
   read  -p "Enter Namespace:"  name 
   read -p "Enter Admin email:"  admin_email 
   read  -p "Enter Hub Domain:"  hub_domain     
   read -p "Enter DB pasword:" db_pass   
   read -p "Enter Smtp Server address:" mail_server 
   read -p "Enter Smtp port:"  mail_port 
   read -p "Enter Smtp user:"  mail_user 
   read -p "Enter Smtp password": mail_pass
   read -p "Enter Smtp email:" mail_email 
 # cat org file to create new modefided file. 
   original_yaml=$(cat chart.yam)
 # create new yaml file. 
   modified_yaml=$(echo "$original_yaml" |
    sed  "s/{{Namespace}}/$name/" |
    sed  "s/{{NODE_COOKIE}}/$node_cookiee/" |
    sed  "s/{{HubDomain}}/$hub_domain/" |
    sed  "s/{{DBpass}}/$db_pass/" |
    sed  "s/{{PermsKey}}/$PermsKey/" |
    sed  "s/{{SmtpServer}}/$mail_server/" |
    sed  "s/{{SmtpPort}}/$mail_port/" |
    sed  "s/{{SmtpUser}}/$mail_user/" |
    sed  "s/{{SmtpPass}}/$mail_pass/" |
    sed  "s/{{UserEmail}}/$mail_email/"|
    sed  "s%{{JWK}}%$jwk%g"
  )
    echo $modified_yaml > render.yam
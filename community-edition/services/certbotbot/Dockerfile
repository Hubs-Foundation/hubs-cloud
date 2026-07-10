from debian:bullseye-slim

ARG TARGETPLATFORM
RUN case ${TARGETPLATFORM} in \
         "linux/amd64")  TARGETARCH=amd64  ;; \
         "linux/arm64")  TARGETARCH=arm64  ;; \
         "linux/arm/v7") TARGETARCH=armhf  ;; \
         "linux/arm/v6") TARGETARCH=armel  ;; \
         "linux/386")    TARGETARCH=i386   ;; \
    esac \
    && apt-get update && apt-get -y install curl nginx certbot python3-certbot-nginx tree jq \
    && curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/${TARGETARCH}/kubectl \
    && chmod +x ./kubectl && mv ./kubectl /usr/local/bin

copy entrypoint.sh entrypoint.sh
entrypoint bash entrypoint.sh http

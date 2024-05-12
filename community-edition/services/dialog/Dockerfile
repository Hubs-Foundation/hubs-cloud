# syntax=docker/dockerfile:1
ARG NODE_VERSION=18

FROM node:${NODE_VERSION} AS build
workdir /app
run apt-get update > /dev/null && apt-get -y install python3-pip > /dev/null
run mkdir certs && openssl req -x509 -newkey rsa:2048 -sha256 -days 36500 -nodes -keyout certs/privkey.pem -out certs/fullchain.pem -subj '/CN=dialog'
copy package.json .
copy package-lock.json .
run npm ci
copy . .
from node:lts-slim
workdir /app
copy --from=build /app /app
# run apt-get update > /dev/null && apt-get install -y jq curl dnsutils netcat > /dev/null
run apt-get update > /dev/null && apt-get install -y jq curl dnsutils > /dev/null
copy scripts/docker/run.sh /run.sh
cmd bash /run.sh

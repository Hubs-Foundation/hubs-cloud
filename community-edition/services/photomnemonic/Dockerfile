# FROM node:lts-alpine
FROM node:bookworm
WORKDIR /app

RUN apt-get update && apt-get -y install libnss3 libexpat1 chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

COPY package.json package-lock.json /app/
#run npm i @sparticuz/chromium
RUN npm install
RUN npm install express

COPY start.sh app.js index.js utils.js /app/
# user nobody
CMD ["/app/start.sh"]

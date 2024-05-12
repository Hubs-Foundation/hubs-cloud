FROM node:lts-alpine
WORKDIR /app
COPY package.json /app/package.json
RUN npm install
COPY app.js index.js /app/
CMD node app.js

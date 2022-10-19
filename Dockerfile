FROM node:16

WORKDIR /burger-bot

COPY package.json package.json

RUN npm install

COPY . .

CMD [ "npm", "start" ]
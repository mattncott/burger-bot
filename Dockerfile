FROM node:25.6.0-bookworm
WORKDIR /usr/burger-bot

COPY package.json .

RUN npm install && npm install typescript -g

COPY . .
COPY .env.example .env

RUN tsc

CMD ["node", "./lib/index.js"]
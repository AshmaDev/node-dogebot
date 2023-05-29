FROM node:18

USER node

WORKDIR /app

COPY --chown=node:node package*.json ./

RUN npm install

COPY --chown=node:node . .

RUN npm run build

VOLUME /app/config

CMD ["node", "dist/index.js"]
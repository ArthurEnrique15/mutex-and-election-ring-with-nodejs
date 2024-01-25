FROM node:20

WORKDIR /app

COPY package.json /app

RUN npm install

CMD ["npm", "run", "dev"]

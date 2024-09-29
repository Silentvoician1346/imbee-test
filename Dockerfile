FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
COPY firebase-sdk.json /app/firebase-sdk.json

EXPOSE 3000

CMD ["npm", "start"]
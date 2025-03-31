FROM node:16-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN npm install -g http-server

CMD ["http-server", "dist", "-p", "80"]

EXPOSE 80

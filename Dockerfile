FROM node:15.13-alpine

WORKDIR /tour_de_app

RUN npm install

ENV PATH="./node_modules/.bin:$PATH"

COPY . .

CMD ["npm", "start"]
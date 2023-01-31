FROM node:15.13-alpine

WORKDIR /tour_de_app

COPY . .

RUN npm install

ENV PATH="./node_modules/.bin:$PATH"

CMD ["npm", "start"]
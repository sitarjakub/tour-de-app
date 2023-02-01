FROM node:16.7

WORKDIR /tour_de_app

COPY . .

RUN npm install

ENV PATH="./node_modules/.bin:$PATH"

CMD ["npm", "start"]
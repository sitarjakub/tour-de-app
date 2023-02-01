FROM node:19-alpine

WORKDIR /tour_de_app

COPY . .

RUN npm install

EXPOSE 80

ENV PATH="./node_modules/.bin:$PATH"

CMD ["npm", "start"]
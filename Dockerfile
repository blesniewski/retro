FROM node:16

# app dir
WORKDIR /usr/src/app

# deps
COPY package*.json .

# required packages
RUN npm install

# code
WORKDIR /usr/src/app/node
COPY node ./

# port
EXPOSE 8081

# run

CMD ["node", "index.js"]
FROM node:alpine
EXPOSE 3000

# Copied from the onbuild version at:
# https://github.com/nodejs/docker-node/blob/28425ed95cebaea2ff589c1516d79c60181983b2/7.4/onbuild/Dockerfile
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# swalls: we might want to move package.json into the server folder.
# As it stands we're copying client code to the server, which it doesn't need
ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app

CMD [ "npm", "start" ]

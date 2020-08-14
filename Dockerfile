FROM node:12
WORKDIR /usr/src/app
COPY server/ server/
COPY client/ client/
WORKDIR /usr/src/app/server
RUN npm install
WORKDIR /usr/src/app/client
RUN npm install
EXPOSE 3000
WORKDIR /usr/src/app/server
ENTRYPOINT ["npm", "run"]
CMD ["dev"]

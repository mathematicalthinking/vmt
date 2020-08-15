FROM node:12
WORKDIR /usr/src/app
COPY . .
WORKDIR /usr/src/app/server
RUN npm install
WORKDIR /usr/src/app/client
RUN npm install
EXPOSE 3000
EXPOSE 3001
WORKDIR /usr/src/app/server
ENTRYPOINT ["npm", "run"]
CMD ["dev"]

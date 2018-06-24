# MERN Template
[mern stack](mern.jpg)

[live example](https://merntemplate.herokuapp.com/)
## Table of Contents
* [Introduction](#introduction)
* [Setup for local development](#setup-for-local-development)
* [Project structure](#project-structure)
* [Customization](#customization)
* [Deployment](#deployment)
* [Redux](#redux)

## Introduction
* This template is intended to provide the necessary architecture for quickly
developing applications using the MERN (MongoDb, Express, React, Node) stack.
This readme will explain how to clone the repository and set it up for local
development, adapt it to your specific needs, and set it up for a production
environment.

## Setup for Local Development
### Make the repo your own
1. clone the template `$ git clone https://github.com/okputadora/MERN-template.git`
1. remove the git history `$ rm -r .git`
1. Initialize your own git repo `git init`
1. Commit the current state of the repository
```
$ git add .
$ git commit -m 'init'
```
1. Add your remote repo `$ git add remote origin <your-project-on-github>`

### Install the node packages
1. Install the dependencies in the root directory`$ npm install`
1. Install the dependencies in the client directoy `$ cd client && npm install`

### Set up a local database
1. Open the .env file in the root directory and replace the MONGO_URI value
(i.e. `'mongodb://localhost/mern-template'`) with your local database

### Start the app
1. In the root directory `$ node bin/www` or `$ nodemon`
1. Then cd into the client directory and run `$ npm start`

__That's it! You're good to go!__

## Project Structure
This template was created using [express-generator](https://github.com/expressjs/generator)
and [create-react-app](https://github.com/facebook/create-react-app). It contains
two example models (User and Message) to demonstrate the flow of the application.

Before describing this flow in detail We will first give an overview of how the project is organized.

The __root__ directory contains all of the server side code while the __client__
directory contains all of the front end code. For the client to talk to the server
we have set a proxy url in the client's package.json `proxy: http://localhost/3001`
and have set the port that server runs on to 3001 in `'./bin/www'`

### Root
* The configuration of the server takes place in app.js and ./bin/www
* The main functionality of the back end resides in routes/ models/ and controllers/
#### Routes
* There is a single route handler in the routes directory called __api__.
* api handles all requests to the backend and then invokes the appropriate controller
depending on the route called.
* For example: if you made a get request from the front end `axios.get('/user')`
this would be caught on the back end with `Router.get('/:resource')`
* To invoke the appropriate controller we import all of them and use the req.params.resource
to pick the right one.
```
const resource = req.params.resource;
const controller = controllers[resource];
```
* This makes the api route handler highly modular and resuable for other projects,
but you do need to ensure that your requests from the front end match the name of a controller
#### Controllers
* The controllers provide the CRUD operations for each model.
* As you build out your project, logic specific to the models will go here. For example,
maybe a profile controller would provide specific logic for encrypting a password before
saving it in the database. That would not happen in the api route (as the api route is agnostic
about which resources it is dealing with) it would happen in the controller.
* All of the controllers are included in an index file so that we can easily require
all of them in the api route handler file.
#### Models
* The models directory contains the mongoose schema definitions and exported
so that the controllers can make use of them.

### Client
As stated before the Client directory is the home of the react/frontend code. For those of you
familiar with the create-react-app architecture this should look pretty familiar with one minor exception.
To make use of CSS modules we have ejected the react scripts and config directories by running
`$ npm run eject` from within the client folder. This allows us to view and edit the webpack
configuration to all for CSS modules (which we have already done for you).

The meat and potatoes of a react app lives in src/ and we have further broken this down
into subdirectories. __index.js__ is solely responsible for rendering the app to the dom
and __App.js__ is responsible for loading the different routes using react-router.
#### Components
* This is where all of stateless/dumb components live
* There are two example components that match our models on the backend.
#### Containers
* This is where all of the stateful/smart components live
* There are two examples containers in the Layout directory. They both render our two dumb
components. The only reason we have two containers is to demonstrate the routing capability.
#### utils
* The utils directory contains all of the requests to the backend and can be invoked anywhere in the application
* we leverage [axios](https://github.com/axios/axios) to make the requests

This structure is definitely not a requirement and as you customize your project
you may find a different folder structure makes sense.

## Customization
* To see an example of how you might go about adding a new model (and its corresponding
  controllers, frontend api requests, and react components) you can watch [this video](videcomingsoong).

## Deployment
1. Before deploying we first need to build the project. cd into the client directory
and run `$ npm run build` this will create a build directory in the public folder
that we will now want to serve up from the backend.
1. Open the App.js in the root directory and uncomment lines 24 - 27
```
app.use(express.static(path.join(__dirname, 'client/build')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});
```
1. Now you're ready to deploy to host of your choice

## Redux
If you would like to use Redux in your project simply run `$ git checkout redux`
and then follow this guide from the beginning.

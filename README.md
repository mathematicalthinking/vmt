# Virtual Math Teams (VMT)[![Build Status](https://travis-ci.org/mathematicalthinking/vmt.svg?branch=master)](https://travis-ci.org/mathematicalthinking/vmt) [![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Virtual Math Teams (VMT) provides a collaboration infrastructure for visual math and geometry tools, such as Geogebra and Desmos. To provide this infrastructure, this version uses React.js and Redux.js, express and sockets.io. see 'Installation' below.

## License

- For non-commercial uses, this application is licensed under the [AGPL](https://www.gnu.org/licenses/agpl-3.0.en.html) license.
- Any use of VMT for commercial purposes is subject to and requires a special license to be negotiated with Mathematical Thinking.
- See [VMT license details](http://files.mathematicalthinking.org/vmt/license)

## Installation (Technologies used)

To provide the colloaboration infrastructure, this application uses a combination of:

- [MongoDB](http://www.mongodb.org/),
- [Express](http://expressjs.com/),
- [Socket.io](https://socket.io/),
- [React.js](https://reactjs.org/),
- [Redux](https://redux.js.org/),
- [Node.js](http://nodejs.org/)

## Setup for local Development
 In its current state, VMT is tightly linked with [EnCOMPASS](https://github.com/mathematicalthinking/encompass). When a user signs up with VMT, they also receive an EnCOMPASS account which has the same username (and vice versa). If a user is logged in to one app, they will also be logged in to the other app. As a result, you must also be running [mt-sso](https://github.com/mathematicalthinking/mt-sso) and [EnCOMPASS](https://github.com/mathematicalthinking/encompass) for user registration and login to work properly. If you do not need signup functionality while developing, then you do not need to be running EnCOMPASS.
 
 If you wish to run VMT separately, then you just need to remove the existing auth routes (`server/routes/auth`) and middleware (`server/middleware/mt-auth`) and put in your own system. There are also routes used solely by EnCOMPASS that could be removed (`server/routes/enc`).


1. Fork this repo ([instructions](https://github.com/mathematicalthinking/vmt/blob/master/docs/gitForkRepo.md))
1. `$ cd vmt/server && npm install`
1. `$ cd ../client && npm install`
1. `$ cd ..`
1. `$ cp .env.example .env`
1. Make sure you have mongodb installed. [instructions here](https://docs.mongodb.com/manual/installation/)
1. From anywhere on your computer run `$ mongod` then cd back to the vmt/ and...
1. `$ npm run dev` This will start the react development server on port 3000 and the express server on 3001 **N.B., you'll need to have nodemon and concurrently installed** these are included in the dev dependencies but you may need to install them globally. `$ npm i -g nodemon concurrently`
1. We utilize [prettier](https://prettier.io/) for formatting.

## Deployment

To deploy this project to staging or production go to the root level directory and run
`$ sh deploy-mac.sh <username> <environment>` where environment = production || staging

This can only be done by the core contributors.

## Contributions and Git Rebase Workflow

1. `git checkout master`
1. `git pull --rebase upstream master`
1. `git push origin master`
1. `git checkout -b feature-branch`
1. `git add/git commit` (on feature branch)
   - To close an issue, add 'closed #[github issue number]' to commit message
1. `git pull --rebase upstream master` (on feature branch)
1. `git push origin feature-branch`
1. Submit pull request (your feature branch to upstream master)

### More Work to do (Pull Request not accepted)

- Go to Step 5 in Git Rebase flow.

### Pull Request Accepted?

1. `git checkout master`
1. `git pull --rebase upstream master`
1. `git push origin master`

### Totally done

1. `git checkout master`
1. `git branch -d feature-branch`

### Troubleshooting

- `git remote -v` to see remote origins
- `git remote add upstream https://github.com/mathematicalthinking/encompass.git`
- if existing upstream `git remote rm upstream`

## Styleguide

We use [Prettier](https://prettier.io/) Add the VS code extension and configure it to format on save.

## Testing

We utilize [Cypress](https://docs.cypress.io/guides/overview/why-cypress.html#In-a-Nutshell) for end to end testing
To run the tests restart the server in test mode `npm run test`
A cypress window will open allowing you to run one or all the integration tests.

## Project structure

### Frontend (client)

There are one million and one ways to structure a react app. I've found the following structure to work well enough.

App.js serves as the entry point of the application and exposes the Redux store
and react-router to the rest of the application.

#### 📁 Routes

There are two primary routes. `/` for
guest users and `/myVMT` for logged in users.

#### 📁 Containers

Containers come in one of two forms. Either they inject props into a component from the redux store.
Or they manage shared local (i.e. non-redux) state for two or more react components (or they do both).

#### 📁 Layout

The layout directory is for organizing...layouts. Each file roughly corresponds to a page.

#### 📁 Components

The shared/reusable UI parts of the app live here

### Backend (root)

#### 📁 Routes

#### 📁 Controllers

#### 📁 Models

#### 📁 Middlerware

#### Sockets.js

#### Additional notes

This project was bootstrapped with [this template](https://github.com/okputadora/MERN-template.git)
refer to its README for additional information regarding the directory structure.

## Helpful links

[Desmos API](https://www.desmos.com/api/v1.1/docs/index.html)
[Geogebra API](https://wiki.geogebra.org/en/Reference:GeoGebra_Apps_API)

- test?

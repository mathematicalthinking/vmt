# VMT React
Virtual Math Teams (VMT) provides a collaboration infrastructure for visual math and geometry tools, such as Geogebra and Desmos. To provide this infrastructure, this version uses React.js and Redux.js, express and sockets.io.  see 'Installation' below.

## License

* For non-commercial uses, this application is licensed under the [AGPL](https://www.gnu.org/licenses/agpl-3.0.en.html) license.
* Any use of VMT for commercial purposes is subject to and requires a special license to be negotiated with Mathematical Thinking.
* See [VMT license details](http://files.mathematicalthinking.org/vmt/license)


## Installation (Technologies used)
To provide the colloaboration infrastructure, this application uses a combination of:

* [MongoDB](http://www.mongodb.org/),
* [Express](http://expressjs.com/),
* [Socket.io](https://socket.io/),
* [React.js](https://reactjs.org/),
* [Redux](https://redux.js.org/),
* [Node.js](http://nodejs.org/)


## Setup for local Development
1. Fork this repo ([instructions](https://github.com/mathematicalthinking/vmt/blob/master/docs/gitForkRepo.md))
1. `$ npm install`
1. `$ nodemon`
1. open a new console tab
1. `$ cd client && npm install`
1. `$ npm start`
1. At this point create-react-app will open a browser window for you and refresh it
every time a change is made.

## Deployment
This should be changed eventually, but it works for now.
```
$ npm run build
$ git add .
$ git commit -m 'built'
$ git push -f heroku HEAD:master
```
## Git Rebase Workflow

1. `git checkout master`
1. `git pull --rebase upstream master`
1. `git push origin master`
1. `git checkout -b feature-branch`
1. `git add/git commit` (on feature branch)
    * To close an issue, add 'closed #[github issue number]' to commit message
1. `git pull --rebase upstream master` (on feature branch)
1. `git push origin feature-branch`
1. Submit pull request (your feature branch to upstream master)

### More Work to do (Pull Request not accepted)
* Go to Step 5 in Git Rebase flow.

### Pull Request Accepted?
1. `git checkout master`
1. `git pull --rebase upstream master`
1. `git push origin master`


### Totally done
1. `git checkout master`
1. `git branch -d feature-branch`


### Troubleshooting
* `git remote -v` to see remote origins
* `git remote add upstream https://github.com/mathematicalthinking/encompass.git`
* if existing upstream `git remote rm upstream`

## Helpful links
[Desmos API](https://www.desmos.com/api/v1.1/docs/index.html)
[Geogebra API](https://wiki.geogebra.org/en/Reference:GeoGebra_Apps_API)

## Testing
We utilize [Cypress](https://docs.cypress.io/guides/overview/why-cypress.html#In-a-Nutshell) for end to end testing
To run the tests restart the server in test mode `npm run test` and then in a new console tab `npm run cypress`
* NB the create-react-app server still needs to be running on port 3000

## Project structure
### Frontend (client)
📁 src
|
-- App.js
|
-- 📁 Routes
|
-- 📁 Containers
|
-- 📁 Layout
|
-- 📁 Components

There are one million and one ways to structure a react app. I've found the following structure to work well enough.

App.js serves as the entry point of the application and exposes the Redux store
and react-router to the rest of the application.

#### 📁 Routes
There are two primary routes. `/` for
guest users and `/myVMT` for logged in users.

#### 📁 Containers
Containers come in one of two forms. Either they inject props into a component from the redux store.
Or they manage shared local (i.e. non-redux) state for two or more react components (or they do both). You can find an
example of the former [here]() and the latter [here]()

#### 📁 Layout
The layout directory is for organizing...layouts. Each file roughly corresponds to a page.

#### 📁 Components
The reusable parts of the app live here

#### Additional notes
This project was bootstrapped with [this template](https://github.com/okputadora/MERN-template.git)
refer to its README for additional information regarding the directory structure.

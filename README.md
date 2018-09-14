# VMT React

## Setup for local Development
1. `$ git clone https://github.com/okputadora/mern-vmt`
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
$ git checkout heroku
$ git merge master
$ cd client && npm run build
$ cd ..
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
To run the tests restart the server is test mode `npm run test` and then in a new console tab `npm run cypress`

## Project structure
This project was bootstrapped with [this template](https://github.com/okputadora/MERN-template.git)
refer to its README for information regarding the directory structure.

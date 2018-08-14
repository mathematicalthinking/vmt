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

## Project structure
This project was bootstrapped with [this template](https://github.com/okputadora/MERN-template.git)
refer to its README for information regarding the directory structure.

## TODO
### General
1. Make React import less verbose by making an index file for Containers Components and Layout
and then import relevant components as named imports
### Profile/Dashboard
1. Profile/Rooms/ is incorecctly duplicating some Rooms I Own into Rooms I'm
enrolled in.
### PublicList
### Course
### Room/Rooms
1. In boxlists of rooms, display room type, creator/owner etc.
### Create
#### Creating Rooms for a course
1. should Public courses be allowed to contain private rooms? Its seems like
no. A Course is just a collection of rooms. We need to add this functionality to
the create resource container `src/containers/create/newResource` If course.isPublic
then no private option...could they still make a private room template?
#### Bug creating resources
1. ~~When we create a new course or room we do not see that users name show up in
the list of members until there is a refresh and they pull from the db again.
We are not saving the user's name in the member list when we update redux, just their id...should be an easy enough fix~~
### Workspace
### Chat
### Replayer

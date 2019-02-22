# VMT (Virutal Math Teams) Development Guide

The following is intended to introduce you to the codebase so that you can make contributions and updates easily
and without fear of breaking other parts of the system.

This guide will be organized into N parts. Part 1 details the project structure.

## 1. Project Structure

### Overview

This application is built with Node/Express/MongoDb on tha backend and React/Redux on the front end. All Frontend or client-side code resides in the client directory. The rest of the root irectory is devoted to the server.

### Backend

The entry point of the application is `./app.js` Here we configure the environment, connect to the database, and establish our routes and their
middleware. You shouldn't need to touch this file at all unless adding new routes or middleware.

#### 📁 Routes

The routes directory is broken down into two main routes **auth** and **api** (you'll notice there is also a desmos route, this is just used for getting the graph data of a desmos link and should not need to be altered).

2. **API**
   There is a single API routing file for the entire application. Every route takes a param called `/:resource` which tells the route which controller to use. e.g.

```javascript
let controller = controllers[req.params.resource];
controller.post(req.body).then(result => res.json(result));
```

The controllers is where the resource-specific logic dictates what to fetch from the database.

1. **Auth**
   The auth route handles our `/login` and `/signup` routes. It passes the `req` and `res` objects to the passport library and then returns a user or error depending on the result passed back from passport. The passport intialization happens in `./config`

#### 📁 Config

Establishes passport authentication. Google strategy has not been implemented.

#### 📁 Controllers

The controllers implement the CRUD operations for each resource defined in `./Models`. It might have been wise to have a "common" controller although I'm unsure if that would have been useful as even simple things like getById() implement specific selection and population logic.

Each controller has the following methods:

- get(params)
- getById(id)
- post(body)
- put(id, body)

The course and room controller have additional `add(id, body)` and `remove(id, body)` methods for adding/removing members.

#### 📁 Models

Mongoose models

- Activity
- Course
- Event
- Message
- Notification
- Room
- Tab
- User

#### 📁 Cypress

### Frontend (📁 Client)

#### 📁 src

Everything you'll need to touch lives in the src directory. (The other directories are for building in production and configuring webpack). The entry point of the frontend code is **index.js** and its sole function is to bind the react app to the dom. The main react file is **App.js** and its function is to configure and provide the redux store to the react application. The configuration for the store is also in the src directory and should not need to be modified. App.js also includes a router which differentiates between two main routes the index route `/` and `/myVMT`. The reaon we've done this here is that the navigation bars will be different depending on whether the user is logged in and viewing their dashboard.

The src directory is broken down into 6 subdirectories. Routes

1. 📁 Store

1. 📁 Routes
   Having a routes folder like this in react application seems bad (and perhaps we'll get rid of it in the future) but for now, it provides an easy way to distinguish between the two ways in which the app can be viewed. From a guest (not logeed in user) perspectivie and a member (logged in user) perspective. The two files in this directory **Home.js** (for guests) and **MyVmt.js** (for logged in users). They each render their own navigation bar.

1. 📁 Containers
   Containers can serve two purposes. They can be used as a wrapper for injecting data and actions from the redux store into a react component, or they can serve as the "logic/state-mgmt" portion of a component if that component is using a generic layout component (from the layout directory). For example, The user's dashboard (@TODO INSER SCREENSHOT) has the same layout whether they are viewing courses, rooms, activities, and single course's room, or activities, or a single acitvity or single room. Rather than recreating that layout for each component we simply reuse one layout (/Layout/Dashboard/Dashboard) and inject all of the data from the containers into it.
   Let's go through an example in detail.

@TODO MOVE THIS TO A DIFFERENT SECTION

### 1. myVMT (Container)

#### Overview

MyVMT.js collects and prepares all of the data we need to display a user's home dashboard view. In the component's local state we initialize the tabs it needs to display and set some flags to determine which resources should be displayed. The resource we are loading is delivered as parameter of the url (:resource).

```javascript
state = {
  tabs: [{ name: "Courses" }, { name: "Activities" }, { name: "Rooms" }],
  touring: false,
  bothRoles: false,
  displayResources: [],
  view: "facilitator"
};
```

Before the component mounts we inject the data and actions we need from the redux store into the container.

```javascript
const mapStateToProps = store => ({
  usercourses: getUserResources(store, "courses") || [],
  userrooms: getUserResources(store, "rooms") || [],
  useractivities: getUserResources(store, "activities") || [],
  user: store.user,
  rooms: store.rooms.allIds,
  courses: store.courses.allIds,
  activities: store.activities.allIds,
  loading: store.loading.loading
});

export default connect(
  mapStateToProps,
  {
    getRooms,
    getActivities,
    getCourses,
    getUser
  }
)(Profile);
```

In the mapStateToProps function we are receiving lists of the user resources (e.g. usercourses) as ids

#### componentDidMount()

When the component mounts we first check the user just logged in. This information is stored on the user object in the redux store as `justLoggedIn`. If they did just log in we don't need to fetch the user info again, but if instead they're navigating from somewhere else in the app we should fetch the user again to see if they have new notifications/resources. **NB** THIS WILL BE UNNECESSARY IF WE IMPLEMENT PUSH NOTIFICATIONS. If we were previously logging in or signing up we do not need to fetch the user again because we just did. If, however, we're coming from somewhere else in the app we should refetch the user to check for any new resources/notifications they might have.

#### componentDidUpdate()

We're listening for 2 types of changes. Either the view was toggled, in which case we need change the displayResources and then tabs, or the resource was changed, in which case we need to fetch the new resource.

Because we potentially want to fetch, changeDisplayResources, and updateTabs both when the component mounts and when it updates, we've abstracted those functions out to their own methods on the class.

#### render()

Here we organize our data so that Dashboard layout component can consume it.

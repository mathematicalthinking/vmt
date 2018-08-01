# Best Practices, Conventions, and Standards
The following section is intended to help collaborators contribute to the app.
Serval conventions and standards are delineated to keep the app clean and maintainable.

## Making API Requests
ALL  requests to the backend should be performed via __Redux__. This will ensure that our
Redux store and backend database stay in synch with each other, and updates (to both)
will be immediately seen by the user.

To see why this is important consider the following scenario:

1. A user logs in and we populate the store with their `courses` from the backend
1. The user creates a new course triggering a post request to the backend

If we don't perform this post request with redux, then we need to make an API request to
the backend AND dispatch an action with the response to update the list of courses in the store.
While that will work, it is cleaner to make the API request with redux so we can dispatch the updates
with middleware.

Let's take a look at the proper way to achieve this by following the course creation example.

1. User logs in

📁 Containers/Login
```
login: (username, password) => dispatch(actions.login(username, password)),
```
when the user licks the login button we'll dispatch the action by calling
`this.props.login(username, password)`

📁 store/actions/user
```
export const login = (username, password) => {
  return dispatch => {
    dispatch(loginStart());
    auth.login(username, password)
    .then(res => {
      if (res.data.errorMessage) {
        return dispatch(loginFail(res.data.errorMessage))
      }
      dispatch(loginSuccess(res.data))
    })
    .catch(err => {
      dispatch(loginFail(err))
    })
  }
}
```
In the login middleware we immediately dispatch loginStart so we can cue up a loading widget. Then
we make our API call with auth.login(username, password). If we get a 200 response then we dispatch
loginSuccess with the user's data, else we dispatch loginFail with an error message.

📁 store/reducers/userReducer
```
...
case actionTypes.LOGIN_SUCCESS:
  // login authentication
  return {
    ...state,
    loggedIn: true,
    loggingIn: false,
    username: action.user.username,
    myRooms: action.user.rooms,
    myCourses: action.user.courses,
    myCourseTemplates: action.user.courseTemplates,
    userId: action.user._id,
  }
```
In the user reducer we update our state with the user info.

2. User creates a new course

📁 Containers/Create/NewResource
```
createCourse: body => dispatch(actions.createCourse(body))
```
when the user clicks "create course" we disptach the action above by calling
`this.props.createCourse(body)`

📁 store/actions/course
```
export const createCourse = body => {
  return dispatch => {
    API.post('course', body)
    .then(resp =>{
      dispatch(updateUserCourses(resp.data.result))
      console.log(body)
      if (body.template) {
        console.log('we should create a template')
        dispatch(updateUserCourseTemplates({...resp.data.result}))
      }
      return dispatch(createdCourse(resp.data.result))
    })
    .catch(err => console.log(err))
  }
}
```
In the createCourse middleware we make a post request to the backend and then (__*This is the crucial point*__)
update the relevant parts of the redux store so that it is synchronized. When creating a course we want to update the complete list of courses, but we also need to update the user's courseList and the courseTemplate list if this was a template. To do this we dispatch updateUserCourses, updateUserCourseTemplates and createdCourse which in turn update the relevant parts of the store via their reducers.

## Receive

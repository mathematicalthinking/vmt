import axios from "axios";
//@TODO get rid of these cutsome promises -- axios is already retruning a promise
// so return axios.get.... will work fine
export default {
  signup: user => {
    return axios.post("/auth/signup", user);
  },
  login: (username, password) => {
    return axios.post("/auth/login", { username, password });
  },

  googleLogin: (username, password) => {
    return axios.get("/auth/googleAuth", { username, password });
  },
  logout: () => {
    return axios.post("/auth/logout");
  }
};

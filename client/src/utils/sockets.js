import io from "socket.io-client";

let url = "http://localhost:3001";
if (process.env.NODE_ENV === "production") {
  url = process.env.REACT_APP_SERVER_URL_PRODUCTION;
} else if (process.env.STAGING) {
  url = process.env.REACT_APP_SERVER_URL_STAGING;
}
console.log("SOCKET URL: ", url);
const socket = io.connect(url);
export default socket;

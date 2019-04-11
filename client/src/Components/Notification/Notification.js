import React from "react";
import classes from "./classes.css";
export default function Notification({ count }) {
  return <i className={["fas fa-bell", classes.Bell].join(" ")}>{count}</i>;
}

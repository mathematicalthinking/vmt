import React from "react";
import classes from "./notification.css";
export default function Notification({ count, size, dataTestId }) {
  return (
    <span
      data-testid={dataTestId || "ntf"}
      className={["fa-stack fa-1x", classes.Container].join(" ")}
    >
      <i
        className={["fas fa-bell fa-stack-2x", classes.Bell].join(" ")}
        style={{ fontSize: size === "small" ? 20 : 32 }}
      />
      <span className={["fa fa-stack-1x", classes.Count].join(" ")}>
        {count}
      </span>
    </span>
  );
}

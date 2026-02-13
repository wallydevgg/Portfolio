import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const Icon = ({ icon, css }) => {
  let IconType = FontAwesomeIcon;
  if (icon.icon[0] === "f") {
    IconType = FontAwesomeIcon;
  } else if (icon.icon[0] === "b") {
    IconType = FontAwesomeIcon;
  }
  return <IconType className={css} icon={icon} />;
};

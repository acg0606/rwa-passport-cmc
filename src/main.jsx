import React from "react";
import { IconContext } from "@phosphor-icons/react";
import { createRoot } from "react-dom/client";
import { App } from "./PassportApp.jsx";
import "./cmc.css";
import "./illustrated-atlas.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <IconContext.Provider value={{size:'1em',weight:'thin'}}><App /></IconContext.Provider>
  </React.StrictMode>,
);


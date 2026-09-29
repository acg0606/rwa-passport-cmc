import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./PassportApp.jsx";
import "./cmc.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);


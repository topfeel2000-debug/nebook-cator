import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Navigator from "../app/navigator";
import "../app/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Navigator />
  </StrictMode>,
);

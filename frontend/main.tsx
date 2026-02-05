import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Element #root introuvable dans index.html");
}
const root = createRoot(container);
root.render(
  <React.StrictMode>
      <GoogleOAuthProvider clientId="105723795846-43hq0q1i8cehqt5ln15vrj3r3iem8j0p.apps.googleusercontent.com">
    <App />
      </GoogleOAuthProvider>
  </React.StrictMode>
);

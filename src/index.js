import "./styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
const script = document.createElement("script");

script.src = "https://cdn.tailwindcss.com";
script.onload = () => {
  console.log("Tailwind loaded via CDN");
};
document.head.appendChild(script);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
const link = document.createElement("link");
link.href =
  "https://fonts.googleapis.com/css2?family=Montserrat:wght@300&display=swap";
link.rel = "stylesheet";
document.head.appendChild(link);

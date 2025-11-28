import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import registerAll from "./registerWidgets";

// Ensure default widgets are registered
registerAll();

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

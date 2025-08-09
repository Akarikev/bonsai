import { DevPanel } from "./dev-panel";
import React from "react";

export function mountDevtools() {
  if (typeof document === "undefined") return;
  const existing = document.getElementById("bonsai-devtools-root");
  if (existing) return; // already mounted

  const container = document.createElement("div");
  container.id = "bonsai-devtools-root";
  document.body.appendChild(container);

  // React 18/19 compatible createRoot import without hard dependency here
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createRoot } = require("react-dom/client");
    const root = createRoot(container);
    root.render(React.createElement(DevPanel));
  } catch {
    // Fallback for very old React versions (shouldn't happen per peerDeps)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ReactDOM = require("react-dom");
    ReactDOM.render(React.createElement(DevPanel), container);
  }
}

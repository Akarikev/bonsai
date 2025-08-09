import { DevPanel } from "./dev-panel";
import React from "react";

declare global {
  interface Window {
    __bonsaiDevtoolsMounted?: boolean;
  }
}

export async function mountDevtools() {
  if (typeof document === "undefined") return;
  if (window.__bonsaiDevtoolsMounted) return;
  const existing = document.getElementById("bonsai-devtools-root");
  if (existing) return;

  if (!document.body || document.readyState === "loading") {
    const onReady = () => {
      document.removeEventListener("DOMContentLoaded", onReady);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      mountDevtools();
    };
    document.addEventListener("DOMContentLoaded", onReady);
    return;
  }

  const container = document.createElement("div");
  container.id = "bonsai-devtools-root";
  document.body.appendChild(container);
  window.__bonsaiDevtoolsMounted = true;

  try {
    const { createRoot } = await import("react-dom/client");
    const root = createRoot(container);
    root.render(React.createElement(DevPanel));
  } catch {
    const ReactDOM = await import("react-dom");
    // @ts-expect-error legacy render for older React versions
    ReactDOM.render(React.createElement(DevPanel), container);
  }
}

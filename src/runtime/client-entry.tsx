import { createRoot } from "react-dom/client";
import { App } from "./App";

function render() {
  const containerEl = document.getElementById("root");
  createRoot(containerEl).render(<App />);
}

render();

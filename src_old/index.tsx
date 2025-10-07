import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import ContextProvider from "./components/providers/ContextProvider";
import { AuthContext } from "./contexts";
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <ContextProvider context={AuthContext}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </ContextProvider>
);

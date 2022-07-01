import React from "react";
import ReactDOM from "react-dom/client";
import { Root } from "./components/Root";

const root = ReactDOM.createRoot(document.querySelector("#root")!);
root.render(<Root />)
// (<Root />, document.querySelector("#root"));

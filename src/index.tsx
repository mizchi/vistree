import React, { Suspense } from "react";
import ReactDOM from "react-dom";

const MonacoEditor = React.lazy(() => import("./components/MonacoEditor"));

function App() {
  return (
    <Suspense fallback="loading...">
      <MonacoEditor />
    </Suspense>
  );
}
ReactDOM.render(<App />, document.querySelector("#root"));

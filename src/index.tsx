import React, { Suspense, useCallback, useState } from "react";
import ReactDOM from "react-dom";
import ts, { tokenToString } from "typescript";
import { Tree } from "./components/Tree";

const MonacoEditor = React.lazy(() => import("./components/MonacoEditor"));

type State = {
  code: string;
  ast: ts.SourceFile;
};

const code = `// code
function x(a) {
  return;
}
// console.log('hello');
// 1111;
// "xxxx";
// false;
// if (true) {
//   1;
// } else {
//   false;
// }
// const x = 1;
// for (const k of [1]) {
//   1;
// }
// var y = 1;
// const z = 2;
`;

const initialState = {
  code: code,
  ast: parseTypeScript(code),
};
function App() {
  const [state, setState] = useState<State>(initialState);
  const onChangeSource = useCallback((value: string) => {
    const ast = parseTypeScript(value);
    console.log(ast.statements.length);
    setState({
      code: value,
      ast,
    });
  }, []);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: "100%",
      }}
    >
      <div style={{ flex: 1, height: "100%" }}>
        <Suspense fallback="loading...">
          <MonacoEditor initialCode={code} onChange={onChangeSource} />
        </Suspense>
      </div>
      <div
        style={{
          color: "#eee",
          background: "#333",
          flex: 1,
          height: "100%",
          fontFamily:
            "SFMono-Regular,Consolas,Liberation Mono,Menlo,Courier,monospace",
        }}
      >
        <Tree tree={state.ast} />
      </div>
    </div>
  );
}
ReactDOM.render(<App />, document.querySelector("#root"));

function parseTypeScript(value: string) {
  return ts.createSourceFile(
    "file:///index.ts",
    value,
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ false,
    ts.ScriptKind.TS
  );
}

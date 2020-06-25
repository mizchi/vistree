import React, { Suspense, useCallback, useState } from "react";
import ReactDOM from "react-dom";
import ts, { tokenToString } from "typescript";

const MonacoEditor = React.lazy(() => import("./components/MonacoEditor"));

type State = {
  code: string;
  ast: ts.SourceFile;
};

const code = `// code
console.log('hello');
1111;
"xxxx";
false;
if (true) {
  1;
} else {
  false;
}
const x = 1;
for (const k of [1]) {
  1;
}
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
      <div style={{ flex: 1, height: "100%" }}>
        <Tree tree={state.ast} />
      </div>
    </div>
  );
}
ReactDOM.render(<App />, document.querySelector("#root"));

function IndentBlock(props: { children: any }) {
  return <div style={{ paddingLeft: "1rem" }}>{props.children}</div>;
}

function UnknownDump(props: { tree: ts.Node }) {
  return (
    <pre>
      <code>
        {ts.SyntaxKind[props.tree.kind]}: {JSON.stringify(props.tree, null, 2)}
      </code>
    </pre>
  );
}

function Tree({ tree }: { tree: ts.Node }) {
  switch (tree.kind) {
    // Root
    case ts.SyntaxKind.Block:
    case ts.SyntaxKind.SourceFile: {
      const childrenNodes: React.ReactNode[] = [];
      let key = 0;
      ts.forEachChild(tree, (child: ts.Node) => {
        if (child.kind === ts.SyntaxKind.EndOfFileToken) {
          return;
        }
        childrenNodes.push(<Tree tree={child} key={key++} />);
      });
      return (
        <div>
          <div>Block:</div>
          <IndentBlock>{childrenNodes}</IndentBlock>
        </div>
      );
    }
    // Misc
    case ts.SyntaxKind.EndOfFileToken: {
      return <div>EoF</div>;
    }

    case ts.SyntaxKind.FirstToken: {
      return <div>FirstToken</div>;
    }

    // Expression
    case ts.SyntaxKind.Identifier: {
      const t = tree as ts.Identifier;
      return <span>Identifier: {t.text}</span>;
    }

    case ts.SyntaxKind.TrueKeyword: {
      return <span>TrueKeyword</span>;
    }

    case ts.SyntaxKind.FalseKeyword: {
      return <span>FalseKeyword</span>;
    }

    case ts.SyntaxKind.ArrayLiteralExpression: {
      const t = tree as ts.ArrayLiteralExpression;

      return (
        <span>
          Array:
          <span style={{ paddingRight: 10 }}>
            {t.elements.map((e, idx) => {
              return <Tree tree={e} key={idx} />;
            })}
          </span>
        </span>
      );
    }

    case ts.SyntaxKind.PropertyAccessExpression: {
      const t = tree as ts.PropertyAccessExpression;
      return (
        <div>
          PropertyAccessExpression
          <IndentBlock>
            <Tree tree={t.expression} />
          </IndentBlock>
          <IndentBlock>
            <Tree tree={t.name} />
          </IndentBlock>
          {/* <IndentBlock></IndentBlock>
          <UnknownDump tree={t} /> */}
        </div>
      );
    }

    case ts.SyntaxKind.CallExpression: {
      const t = tree as ts.CallExpression;
      return (
        <div>
          CallExpression:
          <IndentBlock>
            <Tree tree={t.expression} />
          </IndentBlock>
          <IndentBlock>
            {t.arguments.map((arg, key) => {
              return <Tree tree={arg} key={key} />;
            })}
          </IndentBlock>
        </div>
      );
    }

    case ts.SyntaxKind.StringLiteral: {
      const t = tree as ts.StringLiteral;
      return <span>StringLiteral: {t.text}</span>;
    }

    case ts.SyntaxKind.NumericLiteral:
    case ts.SyntaxKind.FirstLiteralToken: {
      const t = tree as ts.NumericLiteral;
      return <span style={{ padding: 3 }}>NumericLiteral: {t.text}</span>;
    }

    case ts.SyntaxKind.ExpressionStatement: {
      const t = tree as ts.ExpressionStatement;
      return (
        <div>
          ExpressionStatement:
          <IndentBlock>
            <Tree tree={t.expression} />
          </IndentBlock>
        </div>
      );
    }
    // https://github.com/microsoft/TypeScript/blob/master/src/compiler/types.ts#L433
    case ts.SyntaxKind.VariableStatement:
    case ts.SyntaxKind.FirstStatement: {
      // WIP
      const t = tree as ts.VariableStatement;
      // debugger;
      return (
        <div>
          <div>VariableStatement:</div>
          <IndentBlock>
            {t.declarationList.declarations.map((decl, idx) => {
              let el: React.ReactNode;
              if (ts.isIdentifier(decl.name)) {
                el = <div key={idx}>name: {decl.name.text}</div>;
              } else {
                el = <UnknownDump tree={decl.name} />;
              }

              let initializer;
              if (decl.initializer) {
                initializer = <Tree tree={decl.initializer} />;
              } else {
                initializer = <></>;
              }

              return (
                <div key={idx}>
                  {el}
                  {initializer}
                </div>
              );
            })}
          </IndentBlock>
          {t.decorators && (
            <div>
              decorators:
              {t.decorators.map((t, idx) => {
                return (
                  <div key={idx}>
                    expression: <Tree tree={t.expression} />
                  </div>
                );
              })}
            </div>
          )}

          {/* <UnknownDump tree={} /> */}
          {/* <IndentBlock>
            <Tree tree={t.expression} />
          </IndentBlock> */}
        </div>
      );
    }

    case ts.SyntaxKind.ForOfStatement: {
      // WIP
      const t = tree as ts.ForOfStatement;
      return (
        <div>
          <div>ForOfStatement:</div>
          expression:
          <IndentBlock>
            <Tree tree={t.expression} />
          </IndentBlock>
          body:
          <IndentBlock>
            <Tree tree={t.statement} />
          </IndentBlock>
          {/* <UnknownDump tree={t} /> */}
          {/* <IndentBlock>
            <Tree tree={t.expression} />
          </IndentBlock> */}
        </div>
      );
    }
    case ts.SyntaxKind.IfStatement: {
      const t = tree as ts.IfStatement;
      return (
        <div>
          IfStatement:
          <IndentBlock>
            <Tree tree={t.expression} />
          </IndentBlock>
          then
          <IndentBlock>
            <Tree tree={t.thenStatement} />
          </IndentBlock>
          {t.elseStatement && (
            <>
              else
              <IndentBlock>
                <Tree tree={t.elseStatement} />
              </IndentBlock>
            </>
          )}
        </div>
      );
    }
    default: {
      return <div>missing: {ts.SyntaxKind[tree.kind]}</div>;
    }
  }
}

function parseTypeScript(value: string) {
  return ts.createSourceFile(
    "file:///index.ts",
    value,
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ false,
    ts.ScriptKind.TS
  );
}

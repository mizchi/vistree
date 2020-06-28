import React, { Suspense, useCallback, useState } from "react";
import ReactDOM from "react-dom";
import ts from "typescript";
import { Tree } from "./components/Tree";

const MonacoEditor = React.lazy(() => import("./components/MonacoEditor"));

type State = {
  code: string;
  ast: ts.SourceFile;
};

const code_binding = `
const {a} = {a: 1};
const [a] = [1];
`;
const code_import = `
import * as x from "./a";
import { y, z as a } from "./b";
`;

const code3 = `
export interface Sock<T> extends T, U<A> {
  color: string;
  foo: () => void;
  bar(a: number): void;
}

class X<T> extends T implements Y {
  f<K>() {}
}
`;

const code1 = `
// A class is a special type of JavaScript object which
// is always created via a constructor. These classes
// act a lot like objects, and have an inheritance structure
// similar to languages such as Java/C#/Swift.

// Here's an example class:

class Vendor {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  greet() {
    return "Hello, welcome to " + this.name;
  }
}

// An instance can be created via the new keyword, and
// you can call methods and access properties from the
// object.

const shop = new Vendor("Ye Olde Shop");
console.log(shop.greet());

// You can subclass an object. Here's a food cart which
// has a variety as well as a name:

class FoodTruck extends Vendor {
  cuisine: string;

  constructor(name: string, cuisine: string) {
    super(name);
    this.cuisine = cuisine;
  }

  greet() {
    return "Hi, welcome to food truck " + this.name + ". We serve " + this.cuisine + " food.";
  }
}

// Because we indicated that there needs to be two arguments
// to create a new FoodTruck, TypeScript will provide errors
// when you only use one:

const nameOnlyTruck = new FoodTruck("Salome's Adobo");

// Correctly passing in two arguments will let you create a
// new instance of the FoodTruck:

const truck = new FoodTruck("Dave's Doritos", "junk");
console.log(truck.greet());
`;
const code2 = `// code
import React from "react";
import ts, { TypeReference } from "typescript";
import styled from "styled-components";

export function Tree({ tree }: { tree: ts.Node }) {
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
      return <IndentBlock>{childrenNodes}</IndentBlock>;
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
      return <span>{t.text}</span>;
    }
    case ts.SyntaxKind.PropertyDeclaration: {
      const t = tree as ts.PropertyDeclaration;
      console.log(t);
      return (
        <>
          {t.modifiers && <Modifiers modifiers={t.modifiers} />}
          <Tree tree={t.name} />
          {t.type && (
            <>
              :&nbsp;
              <Tree tree={t.type} />
            </>
          )}
          {t.initializer && (
            <>
              &nbsp;=&nbsp;
              <Tree tree={t.initializer} />
            </>
          )}
          ;
        </>
      );
    }
    case ts.SyntaxKind.MethodDeclaration: {
      const t = tree as ts.MethodDeclaration;
      return (
        <>
          {t.modifiers && <Modifiers modifiers={t.modifiers} />}
          <Tree tree={t.name} />(
          {t.parameters.map((p, i) => {
            return (
              <span key={i}>
                <Tree tree={p} key={i} />
                {i !== t.parameters.length - 1 && ", "}
              </span>
            );
          })}
          ) {"{"}
          {t.body && <Tree tree={t.body} />}
          {"}"}
        </>
      );
    }
    case ts.SyntaxKind.ObjectLiteralExpression: {
      const t = tree as ts.ObjectLiteralExpression;
      return (
        <>
          {"{"}
          <IndentBlock>
            {t.properties.map((p, idx) => {
              // console.log("", p);
              // debugger;
              const isLast = idx === t.properties.length - 1;
              if (p.kind === ts.SyntaxKind.PropertyAssignment) {
                return (
                  <div key={idx}>
                    <Tree tree={p.name} />
                    :&nbsp;
                    <Tree tree={p.initializer} />
                    {!isLast && ", "}
                  </div>
                );
              } else if (p.kind === ts.SyntaxKind.ShorthandPropertyAssignment) {
                return (
                  <div key={idx}>
                    <Tree tree={p.name!} />
                    {!isLast && ", "}
                  </div>
                );
              } else if (p.kind === ts.SyntaxKind.MethodDeclaration) {
                const m = p as ts.MethodDeclaration;
                return (
                  <div key={idx}>
                    <Tree tree={m} />
                    {!isLast && ", "}
                  </div>
                );
              } else {
                return <div key={idx}>wip</div>;
              }
            })}
          </IndentBlock>
          {"}"}
        </>
      );
      // return <span>{t.text}</span>;
    }
    case ts.SyntaxKind.PropertyAssignment: {
      const t = tree as ts.PropertyAssignment;
      // return <span>{t.text}</span>;
    }
    case ts.SyntaxKind.ConstKeyword: {
      return <Keyword>const</Keyword>;
    }

    case ts.SyntaxKind.StaticKeyword: {
      return <Keyword>static</Keyword>;
    }
    case ts.SyntaxKind.GetKeyword: {
      return <Keyword>get</Keyword>;
    }
    case ts.SyntaxKind.SetKeyword: {
      return <Keyword>set</Keyword>;
    }

    case ts.SyntaxKind.AsyncKeyword: {
      return <Keyword>async</Keyword>;
    }
    case ts.SyntaxKind.DefaultKeyword: {
      return <Keyword>default</Keyword>;
    }

    case ts.SyntaxKind.TrueKeyword: {
      return <Keyword>true</Keyword>;
    }

    case ts.SyntaxKind.FalseKeyword: {
      return <Keyword>false</Keyword>;
    }
    case ts.SyntaxKind.NumberKeyword: {
      return <Keyword>number</Keyword>;
    }
    case ts.SyntaxKind.StringKeyword: {
      return <Keyword>string</Keyword>;
    }
    case ts.SyntaxKind.BooleanKeyword: {
      return <Keyword>boolean</Keyword>;
    }

    case ts.SyntaxKind.ExportKeyword: {
      return <Keyword>export</Keyword>;
    }
    case ts.SyntaxKind.ImportKeyword: {
      return <Keyword>import</Keyword>;
    }
    case ts.SyntaxKind.ArrayLiteralExpression: {
      const t = tree as ts.ArrayLiteralExpression;
      return (
        <span>
          [
          {t.elements.map((e, idx) => {
            const isLastArg = idx === t.elements.length - 1;
            return (
              <span key={idx}>
                <Tree tree={e} key={idx} />
                {!isLastArg && ", "}
              </span>
            );
          })}
          ]
        </span>
      );
    }
    case ts.SyntaxKind.EqualsToken: {
      return <span>=</span>;
    }
    case ts.SyntaxKind.EqualsEqualsToken: {
      return <span>{"=="}</span>;
    }
    case ts.SyntaxKind.EqualsEqualsEqualsToken: {
      return <span>{"==="}</span>;
    }
    case ts.SyntaxKind.AmpersandAmpersandToken: {
      return <span>{"&&"}</span>;
    }
    case ts.SyntaxKind.AmpersandToken: {
      return <span>{"&"}</span>;
    }
    case ts.SyntaxKind.BarBarToken: {
      return <span>{"||"}</span>;
    }
    case ts.SyntaxKind.BarToken: {
      return <span>{"|"}</span>;
    }
    case ts.SyntaxKind.PlusToken: {
      return <span>{"+"}</span>;
    }
    case ts.SyntaxKind.MinusToken: {
      return <span>{"-"}</span>;
    }
    case ts.SyntaxKind.AsteriskToken: {
      return <span>{"*"}</span>;
    }
    case ts.SyntaxKind.SlashToken: {
      return <span>{"/"}</span>;
    }
    case ts.SyntaxKind.CommaToken: {
      return <span>{","}</span>;
    }

    case ts.SyntaxKind.ParenthesizedExpression: {
      const t = tree as ts.ParenthesizedExpression;
      return (
        <span>
          (<Tree tree={t.expression} />)
        </span>
      );
    }

    case ts.SyntaxKind.BinaryExpression: {
      const t = tree as ts.BinaryExpression;
      return (
        <span>
          <Tree tree={t.left} />
          &nbsp;
          <Tree tree={t.operatorToken} />
          &nbsp;
          <Tree tree={t.right} />
        </span>
      );
    }
    case ts.SyntaxKind.PropertyAccessExpression: {
      const t = tree as ts.PropertyAccessExpression;
      return (
        <span>
          <Tree tree={t.expression} />
          .
          <Tree tree={t.name} />
        </span>
      );
    }
    case ts.SyntaxKind.CallExpression: {
      const t = tree as ts.CallExpression;
      return (
        <span>
          <Tree tree={t.expression} />(
          {t.arguments.map((arg, key) => {
            const isLastArg = key === t.arguments.length - 1;
            return (
              <span key={key}>
                <Tree tree={arg} />
                {!isLastArg && ", "}
              </span>
            );
          })}
          )
        </span>
      );
    }

    case ts.SyntaxKind.StringLiteral: {
      const t = tree as ts.StringLiteral;
      return <Literal>"{t.text}"</Literal>;
    }

    case ts.SyntaxKind.NumericLiteral:
    case ts.SyntaxKind.FirstLiteralToken: {
      const t = tree as ts.NumericLiteral;
      return <Literal>{t.text}</Literal>;
    }

    case ts.SyntaxKind.EmptyStatement: {
      const t = tree as ts.EmptyStatement;
      return <div>{"// (empty)"}</div>;
    }

    case ts.SyntaxKind.ExpressionStatement: {
      const t = tree as ts.ExpressionStatement;
      return (
        <div>
          <Tree tree={t.expression} />;
        </div>
      );
    }

    case ts.SyntaxKind.ImportClause: {
      const t = tree as ts.ImportClause;
      return (
        <>
          {t.isTypeOnly && (
            <>
              <Keyword>type</Keyword>&nbsp;
            </>
          )}
          {t.name && <Tree tree={t.name} />}
        </>
      );
    }

    case ts.SyntaxKind.ExportAssignment: {
      const t = tree as ts.ExportAssignment;
      return (
        <div>
          <Keyword>export</Keyword>
          &nbsp;
          <Keyword>default</Keyword>
          &nbsp;
          <Tree tree={t.expression} />;
        </div>
      );
    }

    case ts.SyntaxKind.ImportDeclaration: {
      const t = tree as ts.ImportDeclaration;
      return (
        <div>
          <Keyword>import</Keyword>
          {t.importClause && (
            <>
              &nbsp;
              <Tree tree={t.importClause} />
              &nbsp;
              <Keyword>from</Keyword>
            </>
          )}
          &nbsp;
          <Tree tree={t.moduleSpecifier} />
        </div>
      );
    }
    // https://github.com/microsoft/TypeScript/blob/master/src/compiler/types.ts#L433
    case ts.SyntaxKind.VariableStatement:
    case ts.SyntaxKind.FirstStatement: {
      // TODO: const
      const t = tree as ts.VariableStatement;
      return (
        <div>
          {t.modifiers && <Modifiers modifiers={t.modifiers} />}
          <Tree tree={t.declarationList} />
          {t.decorators && (
            <div>
              {t.decorators.map((t, idx) => {
                return (
                  <div key={idx}>
                    <Tree tree={t.expression} />
                  </div>
                );
              })}
            </div>
          )}
          ;
        </div>
      );
    }

    case ts.SyntaxKind.VariableDeclarationList: {
      const t = tree as ts.VariableDeclarationList;

      let declType;
      if (t.flags === ts.NodeFlags.Const) declType = "const";
      else if (t.flags === ts.NodeFlags.Let) declType = "let";
      else declType = "var";

      const children = t.declarations.map((decl, idx) => {
        let el: React.ReactNode;
        if (ts.isIdentifier(decl.name)) {
          el = <>{decl.name.text}</>;
        } else {
          el = <UnknownDump tree={decl.name} />;
        }

        let initializer;
        if (decl.initializer) {
          initializer = <Tree tree={decl.initializer} />;
        }
        return (
          <span key={idx}>
            {el}
            {decl.type && (
              <>
                :&nbsp;
                <Tree tree={decl.type} />
              </>
            )}
            {initializer && <>&nbsp;=&nbsp;{initializer}</>}
          </span>
        );
      });

      return (
        <span>
          <Keyword>{declType}</Keyword>
          &nbsp;
          {children}
        </span>
      );
    }
    case ts.SyntaxKind.TypeAliasDeclaration: {
      const t = tree as ts.TypeAliasDeclaration;
      return (
        <div>
          {t.modifiers && <Modifiers modifiers={t.modifiers} />}
          <Keyword>type</Keyword>
          &nbsp;
          <Tree tree={t.name} />
          &nbsp;=&nbsp;
          <Tree tree={t.type} />;
        </div>
      );
    }

    case ts.SyntaxKind.ReturnStatement: {
      const t = tree as ts.ReturnStatement;
      return (
        <div>
          <Keyword>return</Keyword>
          {t.expression && (
            <>
              &nbsp;
              <Tree tree={t.expression} />
            </>
          )}
          ;
        </div>
      );
    }
    case ts.SyntaxKind.Parameter: {
      const t = tree as ts.ParameterDeclaration;
      return (
        <>
          {t.name && <Tree tree={t.name} />}
          {t.type && (
            <>
              :&nbsp;
              <Tree tree={t.type} />
            </>
          )}
        </>
      );
    }
    case ts.SyntaxKind.ArrowFunction: {
      const t = tree as ts.ArrowFunction;
      return (
        <span>
          {t.modifiers &&
            t.modifiers.map((mod, idx) => {
              return (
                <span key={idx}>
                  <Tree tree={mod} />
                  &nbsp;
                </span>
              );
            })}
          (
          {t.parameters.map((p, i) => {
            return (
              <span key={i}>
                <Tree tree={p} key={i} />
                {i !== t.parameters.length - 1 && ", "}
              </span>
            );
          })}
          ) {"=> "}
          {t.body.kind === ts.SyntaxKind.Block ? (
            <>
              {"{"}
              <Tree tree={t.body} />
              {"}"}
            </>
          ) : (
            <Tree tree={t.body} />
          )}
        </span>
      );
    }
    // case ts.SyntaxKind.Class: {

    case ts.SyntaxKind.ClassDeclaration: {
      const t = tree as ts.ClassDeclaration;
      return (
        <div>
          <Keyword>class</Keyword>
          {t.name && (
            <>
              &nbsp;
              <Tree tree={t.name} />
            </>
          )}
          &nbsp;
          {"{"}
          <IndentBlock>
            {t.members &&
              t.members.map((member, idx) => {
                return (
                  <div key={idx}>
                    <Tree tree={member} />
                  </div>
                );
              })}
          </IndentBlock>
          {"}"}
        </div>
      );
      // return <span>{t.text}</span>;
    }

    case ts.SyntaxKind.FunctionDeclaration: {
      const t = tree as ts.FunctionDeclaration;
      return (
        <div>
          {t.modifiers &&
            t.modifiers.map((mod, idx) => {
              return (
                <span key={idx}>
                  <Tree tree={mod} />
                  &nbsp;
                </span>
              );
            })}
          <Keyword>function</Keyword>&nbsp;
          {t.name && <Tree tree={t.name} />}(
          {t.parameters.map((p, i) => {
            const isLastArg = i === t.parameters.length - 1;
            return (
              <span key={i}>
                <Tree tree={p} key={i} />
                {!isLastArg && ", "}
              </span>
            );
          })}
          ) {"{"}
          {t.body && <Tree tree={t.body} />}
          {"}"}
        </div>
      );
    }
    // TODO: for in
    // TODO: for (k = 0)
    case ts.SyntaxKind.ForOfStatement: {
      const t = tree as ts.ForOfStatement;
      return (
        <div>
          <Keyword>for</Keyword>&nbsp;(
          <Tree tree={t.initializer} />
          &nbsp;of&nbsp;
          <Tree tree={t.expression} />
          )&nbsp;{"{"}
          <Tree tree={t.statement} />
          {"}"}
        </div>
      );
    }
    case ts.SyntaxKind.IfStatement: {
      // TODO: Else if
      const t = tree as ts.IfStatement;
      return (
        <div>
          <Keyword>if</Keyword> (
          <Tree tree={t.expression} />) {"{"}
          <Tree tree={t.thenStatement} />
          {t.elseStatement ? (
            <div>
              {"}"}&nbsp;
              <Keyword>else</Keyword>
              &nbsp;
              {"{"}
              <Tree tree={t.elseStatement} />
              {"}"}
            </div>
          ) : (
            <>{"}"}</>
          )}
        </div>
      );
    }
    // types
    case ts.SyntaxKind.LiteralType: {
      // const t = tree as ts.LiteralType;
      // @ts-ignore
      return <Tree tree={tree.literal} />;
    }

    case ts.SyntaxKind.IntersectionType: {
      // @ts-ignore
      const t = tree as ts.IntersectionType;
      return (
        <>
          {t.types.map((c, idx) => {
            const last = idx === t.types.length - 1;
            return (
              <span key={idx}>
                {/* @ts-ignore */}
                <Tree tree={c} />
                {!last && " & "}
              </span>
            );
          })}
        </>
      );
    }

    case ts.SyntaxKind.UnionType: {
      // @ts-ignore
      const t = tree as ts.UnionType;
      return (
        <>
          {t.types.map((c, idx) => {
            const last = idx === t.types.length - 1;
            return (
              <span key={idx}>
                {/* @ts-ignore */}
                <Tree tree={c} />
                {!last && " | "}
              </span>
            );
          })}
        </>
      );
    }
    case ts.SyntaxKind.ParenthesizedType: {
      // @ts-ignore
      const t = tree as ts.ParenthesizedType;
      return (
        <>
          (<Tree tree={t.type} />)
        </>
      );
    }
    case ts.SyntaxKind.TypeReference: {
      // @ts-ignore
      const t = tree as ts.TypeReference;
      // @ts-ignore
      return <Tree tree={t.typeName} />;
    }

    default: {
      return <div>unknown: {ts.SyntaxKind[tree.kind]}</div>;
    }
  }
}

function Modifiers(props: { modifiers: ts.ModifiersArray }) {
  return (
    <>
      {props.modifiers.map((mod, idx) => {
        return (
          <span key={idx}>
            <Tree tree={mod} />
            &nbsp;
          </span>
        );
      })}
    </>
  );
}

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

const Keyword = styled.span\`
  color: #569cd6;
\`;

const Literal = styled.span\`
  color: rgb(181, 206, 168);œ
\`;
`;

const code = code2;

const initialState = {
  code: code,
  ast: parseTypeScript(code),
};
function App() {
  const [state, setState] = useState<State>(initialState);
  const onChangeSource = useCallback((value: string) => {
    const ast = parseTypeScript(value);
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
          position: "relative",
          color: "#eee",
          background: "#222",
          flex: 1,
          height: "100%",
          fontSize: "18px",
          lineHeight: "24px",
          fontFamily:
            "SFMono-Regular,Consolas,Liberation Mono,Menlo,Courier,monospace",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            right: 0,
          }}
        >
          <div
            style={{
              overflowY: "auto",
              overflowX: "auto",
              height: "100%",
              whiteSpace: "nowrap",
            }}
          >
            <Tree tree={state.ast} />
          </div>
        </div>
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
    ts.ScriptKind.TSX
  );
}

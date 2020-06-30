import React, { Suspense, useCallback, useState } from "react";
import ReactDOM from "react-dom";
import ts from "typescript";
import { RootTree } from "./components/Tree";
import type * as monaco from "monaco-editor";
import { astToCode } from "./worker/typescript.worker";
import { format } from "./worker/prettier.worker";

const MonacoEditor = React.lazy(() => import("./components/MonacoEditor"));

const code_test = `
switch (true) {
  case true:
  case false: {
    1;
  }
}
`;

const code_binding = `
const {a} = {a: 1};
const [a] = [1];
`;
const code_import = `
import * as x from "./a";
import { y, z as a } from "./b";
`;

const code3 = `
import React, { useContext, useRef } from "react";
import ts from "typescript";
import styled from "styled-components";

const SourceContext = React.createContext<ts.SourceFile>(null as any);
const HandlerContext = React.createContext<
  (old: ts.Node, next: ts.Node) => void
>(null as any);

export function RootTree(props: {
  tree: ts.SourceFile;
  onChangeNode: (old: ts.Node, next: ts.Node) => void;
}) {
  return (
    <SourceContext.Provider value={props.tree}>
      <HandlerContext.Provider value={props.onChangeNode}>
        <Tree tree={props.tree} />
      </HandlerContext.Provider>
    </SourceContext.Provider>
  );
}

export function Tree({ tree }: { tree: ts.Node }) {
  // const source = useContext(SourceContext);
  const onChangeNode = useContext(HandlerContext);
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
      const ref = useRef<HTMLSpanElement>(null);
      return (
        <input
          defaultValue={t.text}
          style={{
            background: "#222",
            color: "#eee",
            border: "none",
            outline: "1px solid #ccc",
            fontFamily:
              "SFMono-Regular,Consolas,Liberation Mono,Menlo,Courier,monospace",
            width: \`\${t.text.length * 8 + 6}px\`,
          }}
          onChange={(ev) => {
            const value = ev.target.value;
            ev.target.style.width = \`\${value.length * 8 + 6}px\`;
            // console.log("change to", value);
            onChangeNode(t, ts.createIdentifier(value));
            // onChange(ev.target.value, t.pos, t.end);
          }}
        ></input>
      );
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
          <Tree tree={t.name} />
          {t.typeParameters && (
            <TypeParameters typeParameters={t.typeParameters} />
          )}
          (
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
    case ts.SyntaxKind.BindingElement: {
      const t = tree as ts.BindingElement;
      return (
        <span>
          <Tree tree={t.name} />
          {t.propertyName && (
            <>
              :&nbsp;
              <Tree tree={t.propertyName} />
            </>
          )}
        </span>
      );
    }
    case ts.SyntaxKind.ArrayBindingPattern: {
      const t = tree as ts.ArrayBindingPattern;
      return (
        <>
          {"[ "}
          {t.elements.map((el, idx) => {
            const last = idx === t.elements.length - 1;
            return (
              <span key={idx}>
                <Tree tree={el} />
                {!last && ", "}
              </span>
            );
          })}
          {" ]"}
        </>
      );
    }

    case ts.SyntaxKind.ObjectBindingPattern: {
      const t = tree as ts.ObjectBindingPattern;
      return (
        <>
          {"{ "}
          {t.elements.map((el, idx) => {
            const last = idx === t.elements.length - 1;
            return (
              <span key={idx}>
                <Tree tree={el} />
                {!last && ", "}
              </span>
            );
          })}
          {" }"}
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
    case ts.SyntaxKind.ThisKeyword: {
      return <Keyword>this</Keyword>;
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
    case ts.SyntaxKind.SuperKeyword: {
      return <Keyword>super</Keyword>;
    }

    case ts.SyntaxKind.BooleanKeyword: {
      return <Keyword>boolean</Keyword>;
    }
    case ts.SyntaxKind.NullKeyword: {
      return <Keyword>null</Keyword>;
    }

    case ts.SyntaxKind.VoidKeyword: {
      return <Keyword>void</Keyword>;
    }

    case ts.SyntaxKind.AnyKeyword: {
      return <Keyword>any</Keyword>;
    }

    case ts.SyntaxKind.ExportKeyword: {
      return <Keyword>export</Keyword>;
    }
    case ts.SyntaxKind.ImportKeyword: {
      return <Keyword>import</Keyword>;
    }
    case ts.SyntaxKind.ReadonlyKeyword: {
      return <Keyword>readonly</Keyword>;
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
    case ts.SyntaxKind.ExclamationEqualsEqualsToken: {
      return <span>{"!=="}</span>;
    }
    case ts.SyntaxKind.ExclamationEqualsToken: {
      return <span>{"!="}</span>;
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
    case ts.SyntaxKind.ArrayLiteralExpression: {
      const t = tree as ts.ArrayLiteralExpression;
      return (
        <span>
          {"[ "}
          {t.elements.map((e, idx) => {
            const isLastArg = idx === t.elements.length - 1;
            return (
              <span key={idx}>
                <Tree tree={e} key={idx} />
                {!isLastArg && ", "}
              </span>
            );
          })}
          {" ]"}
        </span>
      );
    }
    case ts.SyntaxKind.ConditionalExpression: {
      const t = tree as ts.ConditionalExpression;
      return (
        <>
          <Tree tree={t.condition} />
          {"?"}
          <Tree tree={t.whenTrue} />
          {":"}
          <Tree tree={t.whenFalse} />
        </>
      );
    }
    case ts.SyntaxKind.ParenthesizedExpression: {
      const t = tree as ts.ParenthesizedExpression;
      return (
        <span>
          (<Tree tree={t.expression} />)
        </span>
      );
    }

    case ts.SyntaxKind.NoSubstitutionTemplateLiteral: {
      const t = tree as ts.NoSubstitutionTemplateLiteral;
      return (
        <span>
          {"\`"}
          {t.text}
          {"\`"}
        </span>
      );
    }
    case ts.SyntaxKind.TemplateExpression: {
      const t = tree as ts.TemplateExpression;
      return (
        <span>
          {"\`"}
          {t.head.text}
          {t.templateSpans.map((span, idx) => {
            return (
              <span key={idx}>
                {"\${"}
                <Tree tree={span.expression} />
                {"$}"}
                {span.literal.text}
              </span>
            );
          })}
          {"\`"}
        </span>
      );
    }

    case ts.SyntaxKind.TaggedTemplateExpression: {
      const t = tree as ts.TaggedTemplateExpression;
      return (
        <span>
          <Tree tree={t.tag} />
          <Tree tree={t.template} />
        </span>
      );
    }
    case ts.SyntaxKind.NewExpression: {
      const t = tree as ts.NewExpression;
      return (
        <span>
          <Keyword>new</Keyword>
          &nbsp;
          <Tree tree={t.expression} />(
          {t.arguments && <Arguments arguments={t.arguments} />})
        </span>
      );
    }

    case ts.SyntaxKind.ElementAccessExpression: {
      const t = tree as ts.ElementAccessExpression;
      return (
        <span>
          <Tree tree={t.expression} />
          {t.questionDotToken && <>?.</>}
          [<Tree tree={t.argumentExpression} />]
        </span>
      );
    }

    case ts.SyntaxKind.NonNullExpression: {
      const t = tree as ts.NonNullExpression;
      return (
        <span>
          <Tree tree={t.expression} />!
        </span>
      );
    }

    case ts.SyntaxKind.PrefixUnaryExpression: {
      const t = tree as ts.PostfixUnaryExpression;
      let token = {};
      if (t.operator === ts.SyntaxKind.PlusPlusToken) {
        token = "++";
      } else if (ts.SyntaxKind.MinusMinusToken) {
        token = "--";
      } else if (ts.SyntaxKind.ExclamationToken) {
        token = "!";
      }

      return (
        <span>
          {token}
          <Tree tree={t.operand} />
        </span>
      );
    }

    case ts.SyntaxKind.PostfixUnaryExpression: {
      const t = tree as ts.PostfixUnaryExpression;
      let token;
      if (t.operator === ts.SyntaxKind.PlusPlusToken) {
        token = "++";
      } else {
        token = "--";
      }
      return (
        <span>
          <Tree tree={t.operand} />
          {token}
        </span>
      );
    }

    case ts.SyntaxKind.AsExpression: {
      const t = tree as ts.AsExpression;
      return (
        <span>
          <Tree tree={t.expression} />
          &nbsp;
          <Keyword>as</Keyword>
          &nbsp;
          <Tree tree={t.type} />
        </span>
      );
    }

    // JSX
    case ts.SyntaxKind.JsxText: {
      const t = tree as ts.JsxText;
      return <>{t.text}</>;
    }

    case ts.SyntaxKind.JsxFragment: {
      const t = tree as ts.JsxFragment;
      return (
        <>
          {"<>"}
          <IndentBlock>
            {t.children.map((c, idx) => {
              return (
                <div key={idx}>
                  <Tree tree={c} />
                </div>
              );
            })}
          </IndentBlock>
          {"</>"}
        </>
      );
    }

    case ts.SyntaxKind.JsxExpression: {
      const t = tree as ts.JsxExpression;
      return (
        <>
          {"{"}
          {t.expression && <Tree tree={t.expression} />}
          {"} "}
        </>
      );
    }

    case ts.SyntaxKind.JsxSelfClosingElement: {
      const t = tree as ts.JsxSelfClosingElement;
      return (
        <span>
          {"<"}
          <Tree tree={t.tagName} />
          &nbsp;
          {t.attributes.properties.map((attr, idx) => {
            if (attr.kind === ts.SyntaxKind.JsxAttribute) {
              const tt = attr as ts.JsxAttribute;
              return (
                <span key={idx}>
                  {tt.name && <Tree tree={tt.name} />}
                  {tt.initializer && (
                    <>
                      =<Tree tree={tt.initializer} />
                    </>
                  )}
                </span>
              );
            } else {
              const tt = attr as ts.JsxSpreadAttribute;
              return (
                <span key={idx}>
                  {"{..."}
                  <Tree tree={tt.expression} />
                </span>
              );
            }
          })}
          {" />"}
        </span>
      );
    }

    case ts.SyntaxKind.JsxOpeningElement: {
      const t = tree as ts.JsxOpeningElement;
      return (
        <>
          {"<"}
          <Tree tree={t.tagName} />
          {t.attributes.properties.map((attr, idx) => {
            if (attr.kind === ts.SyntaxKind.JsxAttribute) {
              const tt = attr as ts.JsxAttribute;
              return (
                <span key={idx}>
                  &nbsp;
                  {tt.name && <Tree tree={tt.name} />}
                  {tt.initializer && (
                    <>
                      =<Tree tree={tt.initializer} />
                    </>
                  )}
                </span>
              );
            } else {
              const tt = attr as ts.JsxSpreadAttribute;
              return (
                <span key={idx}>
                  &nbsp;
                  {"{..."}
                  <Tree tree={tt.expression} />
                </span>
              );
            }
          })}
          {">"}
        </>
      );
    }
    case ts.SyntaxKind.JsxClosingElement: {
      const t = tree as ts.JsxClosingElement;
      return (
        <>
          {"</"}
          <Tree tree={t.tagName} />
          {">"}
        </>
      );
    }

    case ts.SyntaxKind.JsxElement: {
      const t = tree as ts.JsxElement;
      return (
        <span>
          <IndentBlock>
            <Tree tree={t.openingElement} />
            <IndentBlock>
              {t.children.map((c, idx) => {
                return (
                  <div key={idx}>
                    <Tree tree={c} />{" "}
                  </div>
                );
              })}
            </IndentBlock>
            <Tree tree={t.closingElement} />
          </IndentBlock>
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
          {t.questionDotToken ? "?." : "."}
          <Tree tree={t.name} />
        </span>
      );
    }
    case ts.SyntaxKind.CallExpression: {
      const t = tree as ts.CallExpression;
      return (
        <span>
          <Tree tree={t.expression} />(
          <Arguments arguments={t.arguments} />)
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
    case ts.SyntaxKind.ImportSpecifier: {
      const t = tree as ts.ImportSpecifier;
      return (
        <>
          {t.propertyName ? (
            <>
              <Tree tree={t.propertyName} />
              &nbsp;
              <Keyword>as</Keyword>
              &nbsp;
              <Tree tree={t.name} />
            </>
          ) : (
            <Tree tree={t.name} />
          )}
        </>
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
          {t.namedBindings?.kind === ts.SyntaxKind.NamespaceImport && (
            <>
              <Keyword>{"*"}</Keyword>
              {t.namedBindings.name && (
                <>
                  &nbsp;
                  <Keyword>as</Keyword>
                  &nbsp;
                  <Tree tree={t.namedBindings.name} />
                </>
              )}
            </>
          )}
          {t.namedBindings?.kind === ts.SyntaxKind.NamedImports && (
            <>
              {t.name && ", "}
              {"{ "}
              {(t.namedBindings as ts.NamedImports).elements.map(
                (bind, idx) => {
                  const last =
                    idx ===
                    (t.namedBindings as ts.NamedImports).elements.length - 1;
                  return (
                    <span key={idx}>
                      <Tree tree={bind} />
                      {!last && <>, </>}
                    </span>
                  );
                }
              )}
              {" }"}
            </>
          )}
        </>
      );
    }

    case ts.SyntaxKind.ExpressionWithTypeArguments: {
      const t = tree as ts.ExpressionWithTypeArguments;
      return (
        <>
          <Tree tree={t.expression} />
          {t.typeArguments && <TypeArguments typeArguments={t.typeArguments} />}
        </>
      );
    }

    case ts.SyntaxKind.HeritageClause: {
      const t = tree as ts.HeritageClause;
      console.log(t);

      return (
        <>
          &nbsp;
          {t.token === ts.SyntaxKind.ExtendsKeyword && (
            <Keyword>extends</Keyword>
          )}
          {t.token === ts.SyntaxKind.ImplementsKeyword && (
            <Keyword>implements</Keyword>
          )}
          &nbsp;
          {t.types.map((tt, idx) => {
            const last = idx === t.types!.length - 1;

            return (
              <span key={idx}>
                <Tree tree={tt} />
                {!last && <>, </>}
              </span>
            );
          })}
        </>
      );
    }

    case ts.SyntaxKind.TypeParameter: {
      const t = (tree as unknown) as any;
      return (
        <>
          <Tree tree={t.name} />
        </>
      );
    }
    case ts.SyntaxKind.InterfaceDeclaration: {
      // TODO: extends
      const t = tree as ts.InterfaceDeclaration;
      return (
        <div>
          {t.modifiers && <Modifiers modifiers={t.modifiers} />}
          <Keyword>interface</Keyword>
          &nbsp;
          <Tree tree={t.name} />
          {t.typeParameters && (
            <TypeParameters typeParameters={t.typeParameters} />
          )}
          {t.heritageClauses && (
            <>
              {t.heritageClauses.map((h, idx) => {
                const last: boolean = idx === t.heritageClauses!.length - 1;
                return (
                  <span key={idx}>
                    <Tree tree={h} />
                    {!last && <>, </>}
                  </span>
                );
              })}
            </>
          )}
          {" {"}
          <IndentBlock>
            {t.members.map((m, idx) => {
              return (
                <div key={idx}>
                  <Tree tree={m} />;
                </div>
              );
            })}
          </IndentBlock>
          {"}"}
        </div>
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
          el = <Tree tree={decl.name} />;
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
    case ts.SyntaxKind.ReturnStatement: {
      const t = tree as ts.ReturnStatement;
      return (
        <div>
          <Keyword>return</Keyword>
          {t.expression && (
            <>
              &nbsp;
              {"("}
              <Tree tree={t.expression} />
              {")"}
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

    case ts.SyntaxKind.FunctionType: {
      const t = tree as ts.FunctionTypeNode;
      return (
        <>
          {t.modifiers && <Modifiers modifiers={t.modifiers} />}(
          {t.parameters.map((p, idx) => {
            const last = idx === t.parameters.length - 1;
            return (
              <span key={idx}>
                <Tree tree={p} />
                {!last && ", "}
              </span>
            );
          })}
          ){" => "}
          <Tree tree={t.type} />
        </>
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

    case ts.SyntaxKind.Constructor: {
      const t = tree as ts.ConstructorDeclaration;
      return (
        <>
          <Keyword>constructor</Keyword>(
          <Parameters parameters={t.parameters} />){" {"}
          {t.body && <Tree tree={t.body} />}
          {"}"}
        </>
      );
    }

    case ts.SyntaxKind.ClassDeclaration: {
      const t = tree as ts.ClassDeclaration;
      return (
        <div>
          <Keyword>class</Keyword>
          {t.name && (
            <>
              &nbsp;
              <Tree tree={t.name} />
              {t.typeParameters && (
                <TypeParameters typeParameters={t.typeParameters} />
              )}
            </>
          )}
          {t.heritageClauses && (
            <>
              {t.heritageClauses.map((h, idx) => {
                const last: boolean = idx === t.heritageClauses!.length - 1;
                return (
                  <span key={idx}>
                    <Tree tree={h} />
                  </span>
                );
              })}
              &nbsp;
            </>
          )}
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
          <Parameters parameters={t.parameters} />) {"{"}
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
          <IndentBlock>
            <Tree tree={t.thenStatement} />
          </IndentBlock>
          {t.elseStatement ? (
            <div>
              {"}"}&nbsp;
              <Keyword>else</Keyword>
              &nbsp;
              {"{"}
              <IndentBlock>
                <Tree tree={t.elseStatement} />
              </IndentBlock>
              {"}"}
            </div>
          ) : (
            <>{"}"}</>
          )}
        </div>
      );
    }

    case ts.SyntaxKind.SwitchStatement: {
      const t = tree as ts.SwitchStatement;
      return (
        <div>
          <Keyword>switch</Keyword> (
          <Tree tree={t.expression} />) {"{"}
          {t.caseBlock.clauses.map((clause, idx) => {
            if (clause.kind === ts.SyntaxKind.DefaultClause) {
              const c = clause as ts.DefaultClause;
              // console.log(c);
              return (
                <div key={idx}>
                  <Keyword>default</Keyword>:
                  <>
                    {"{"}
                    <IndentBlock>
                      {c.statements.map((stmt, idx) => {
                        return <Tree tree={stmt} key={idx} />;
                      })}
                    </IndentBlock>
                    {"}"}
                  </>
                </div>
              );
            } else {
              const c = clause as ts.CaseClause;
              const isBlock = c.statements[0]?.kind === ts.SyntaxKind.Block;
              return (
                <IndentBlock key={idx}>
                  <Keyword>case</Keyword>
                  &nbsp;
                  <Tree tree={c.expression} />
                  {":"}
                  {c.statements.length > 0 && (
                    <>
                      {isBlock ? (
                        <>
                          &nbsp;{"{"}
                          {c.statements.map((stmt, idx) => {
                            return <Tree tree={stmt} key={idx} />;
                          })}
                          {"}"}
                        </>
                      ) : (
                        <>
                          <IndentBlock>
                            {c.statements.map((stmt, idx) => {
                              return <Tree tree={stmt} key={idx} />;
                            })}
                          </IndentBlock>
                        </>
                      )}
                    </>
                  )}
                </IndentBlock>
              );
            }
          })}
          {"}"}
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
    // Qualified
    case ts.SyntaxKind.FirstNode: {
      const t = (tree as unknown) as ts.QualifiedName;
      return (
        <>
          <Tree tree={t.left} />
          .
          <Tree tree={t.right} />
        </>
      );
    }
    case ts.SyntaxKind.PropertySignature: {
      const t = (tree as unknown) as ts.PropertySignature;
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
              =&nbsp;
              <Tree tree={t.initializer} />
            </>
          )}
        </>
      );
    }
    case ts.SyntaxKind.MethodSignature: {
      const t = tree as ts.MethodSignature;
      return (
        <>
          {t.modifiers && <Modifiers modifiers={t.modifiers} />}
          <Tree tree={t.name} />
          (
          <Parameters parameters={t.parameters} />)
          {t.type && (
            <>
              :&nbsp;
              <Tree tree={t.type} />
            </>
          )}
        </>
      );
    }

    case ts.SyntaxKind.ArrayType: {
      const t = tree as ts.ArrayTypeNode;
      return (
        <>
          <Tree tree={t.elementType} />
          []
        </>
      );
    }

    case ts.SyntaxKind.TypeLiteral: {
      const t = (tree as unknown) as ts.TypeLiteralNode;
      // @ts-ignore
      return (
        <>
          {"{"}
          {t.members.map((member, idx) => {
            return (
              <span key={idx}>
                <Tree tree={member} />
              </span>
            );
          })}
          {"}"}
        </>
      );
    }

    case ts.SyntaxKind.TypeReference: {
      const t = tree as ts.TypeReferenceNode;
      return (
        <>
          <Tree tree={t.typeName} />
          {t.typeArguments && <TypeArguments typeArguments={t.typeArguments} />}
        </>
      );
    }

    default: {
      return (
        <span style={{ color: "red" }}>
          [unknown: {ts.SyntaxKind[tree.kind]}]
        </span>
      );
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

function UnknownDump(props: { tree: ts.Node }) {
  return (
    <pre>
      <code>
        {ts.SyntaxKind[props.tree.kind]}: {JSON.stringify(props.tree, null, 2)}
      </code>
    </pre>
  );
}

function TypeArguments(props: { typeArguments: ts.NodeArray<ts.TypeNode> }) {
  return (
    <>
      {"<"}
      {props.typeArguments.map((tt, idx) => {
        const last = idx === props.typeArguments!.length - 1;
        return (
          <span key={idx}>
            <Tree tree={tt} />
            {!last && <>, </>}
          </span>
        );
      })}
      {">"}
    </>
  );
}

function TypeParameters(props: {
  typeParameters: ts.NodeArray<ts.TypeParameterDeclaration>;
}) {
  return (
    <>
      {"<"}
      {props.typeParameters.map((tt, idx) => {
        const last = idx === props.typeParameters!.length - 1;
        return (
          <span key={idx}>
            <Tree tree={tt} />
            {!last && <>, </>}
          </span>
        );
      })}
      {">"}
    </>
  );
}

function Arguments(props: { arguments: ts.NodeArray<ts.Expression> }) {
  return (
    <>
      {props.arguments.map((arg, key) => {
        const isLastArg = key === props.arguments.length - 1;
        return (
          <span key={key}>
            <Tree tree={arg} />
            {!isLastArg && ", "}
          </span>
        );
      })}
    </>
  );
}

function Parameters(props: {
  parameters: ts.NodeArray<ts.ParameterDeclaration>;
}) {
  return (
    <>
      {props.parameters.map((p, i) => {
        const isLastArg = i === props.parameters.length - 1;
        return (
          <span key={i}>
            <Tree tree={p} key={i} />
            {!isLastArg && ", "}
          </span>
        );
      })}
    </>
  );
}

const Keyword = styled.span\`
  color: #569cd6;
\`;

const Literal = styled.span\`
  color: rgb(181, 206, 168);
\`;

function IndentBlock(props: { children: any }) {
  return <div style={{ paddingLeft: "1rem" }}>{props.children}</div>;
}
`;

const initialCode = code3;

function App() {
  const [code, setCode] = useState<string>(initialCode);
  const [ast, setAst] = useState<ts.SourceFile>(parseTypeScript(code));
  const [checkpointCode, setCheckpointCode] = useState<string>(code);
  const [
    editor,
    setEditor,
  ] = useState<null | monaco.editor.IStandaloneCodeEditor>(null);

  const onInit = useCallback((ed) => {
    setEditor(ed);
  }, []);

  const onChangeCode = useCallback((value: string) => {
    const ast = parseTypeScript(value);
    setAst(ast);
  }, []);

  const onChangeNode = useCallback(
    async (prev: ts.Node, next: ts.Node) => {
      function rewriter(): ts.TransformerFactory<ts.Node> {
        return (context) => {
          const visit: ts.Visitor = (node) => {
            const isSameNode = node.kind === prev.kind && node.pos === prev.pos;
            if (isSameNode) {
              return next;
            }
            return ts.visitEachChild(node, (child) => visit(child), context);
          };
          return (node) => ts.visitNode(node, visit);
        };
      }
      const result = ts.transform(ast, [rewriter()]);
      const newAst = result.transformed[0] as ts.SourceFile;
      setAst(newAst);
      console.time("print");
      const newCode = await astToCode(result.transformed[0] as ts.SourceFile);
      console.timeEnd("print");
      console.time("format");
      const newCodeFormatted = await format(newCode);
      console.timeEnd("format");
      setCode(newCodeFormatted);
      setCheckpointCode(newCodeFormatted);
    },
    [code, ast]
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: "100%",
      }}
    >
      <div style={{ flex: 1, height: "100%", maxWidth: "50%" }}>
        <Suspense fallback="loading...">
          <MonacoEditor
            initialCode={checkpointCode}
            onChange={onChangeCode}
            onInit={onInit}
          />
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
            <RootTree tree={ast} onChangeNode={onChangeNode} />
          </div>
        </div>
      </div>
    </div>
  );
}
ReactDOM.render(<App />, document.querySelector("#root"));

function parseTypeScript(value: string) {
  console.time("parse");
  const ret = ts.createSourceFile(
    "file:///index.ts",
    value,
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ false,
    ts.ScriptKind.TSX
  );
  console.timeEnd("parse");
  return ret;
}

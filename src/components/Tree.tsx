import React from "react";
import ts from "typescript";
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

      // return (
      //   <div>
      //     {"{"}
      //     <IndentBlock>{childrenNodes}</IndentBlock>
      //     {"}"}
      //   </div>
      // );
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

    case ts.SyntaxKind.ArrayLiteralExpression: {
      const t = tree as ts.ArrayLiteralExpression;
      return (
        <span>
          [
          {t.elements.map((e, idx) => {
            return (
              <span key={idx}>
                <Tree tree={e} key={idx} />
                {idx !== t.elements.length - 1 && ", "}
              </span>
            );
          })}
          ]
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
            return <Tree tree={arg} key={key} />;
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
    // https://github.com/microsoft/TypeScript/blob/master/src/compiler/types.ts#L433
    case ts.SyntaxKind.VariableStatement:
    case ts.SyntaxKind.FirstStatement: {
      // TODO: const
      const t = tree as ts.VariableStatement;
      // console.log(t.declarationList);
      return (
        <div>
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
      const children = t.declarations.map((decl, idx) => {
        // console.log("kind", ts.SyntaxKind[decl.kind], decl.kind);
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
            {initializer && <>&nbsp;=&nbsp;{initializer}</>}
          </span>
        );
      });
      let declType;
      if (t.flags === ts.NodeFlags.Const) declType = "const";
      else if (t.flags === ts.NodeFlags.Let) declType = "let";
      else declType = "var";

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
          return
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
      const t = tree as ts.FunctionDeclaration;
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
    case ts.SyntaxKind.FunctionDeclaration: {
      const t = tree as ts.FunctionDeclaration;
      return (
        <div>
          <Keyword>function</Keyword>&nbsp;
          {t.name && <Tree tree={t.name} />}
          &nbsp;(
          {t.parameters.map((p, i) => {
            return (
              <>
                <Tree tree={p} key={i} />
                {i !== t.parameters.length - 1 && ", "}
              </>
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
    default: {
      return <div>unknown: {ts.SyntaxKind[tree.kind]}</div>;
    }
  }
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

const Keyword = styled.span`
  color: #569cd6;
`;

const Literal = styled.span`
  color: rgb(181, 206, 168);
`;

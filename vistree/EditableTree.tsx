import React, { useState, useCallback, Context } from "react";
import ts from "typescript";
import styled from "styled-components";
import MonacoEditor from "react-monaco-editor";

import {
  VisualTree,
  CodeRenderer,
  useRendererContext,
  Keyword,
  IndentBlock,
} from "./VisualTree";

type EditableContext = {
  onChangeNode: (prev: ts.Node, next: ts.Node) => void;
  onUpdateSource: (newStatements: ts.Statement[]) => void;
};

export function EditableTree(props: {
  ast: ts.SourceFile;
  onChangeNode: (prev: ts.Node, next: ts.Node) => void;
  onUpdateSource: (statements: ts.Statement[]) => void;
}) {
  return (
    <VisualTree
      renderer={EditableRenderer}
      root={props.ast}
      context={{
        onChangeNode: props.onChangeNode,
        onUpdateSource: props.onUpdateSource,
      }}
    />
  );
}

function EditableRenderer({ tree }: { tree: ts.Node }) {
  const { renderer: Tree, context } = useRendererContext<EditableContext>();
  switch (tree.kind) {
    // case ts.SyntaxKind.Identifier: {
    //   return (
    //     <EditableIdentifier
    //       identifier={tree as ts.Identifier}
    //       onChangeNode={context.onChangeNode}
    //     />
    //   );
    // }
    case ts.SyntaxKind.SourceFile: {
      return <EditableSourceFile sourceFile={tree as ts.SourceFile} />;
    }
    case ts.SyntaxKind.Block: {
      return (
        <EditableBlock
          block={tree as ts.Block}
          onChangeNode={context.onChangeNode}
        />
      );
    }

    case ts.SyntaxKind.IfStatement: {
      const t = tree as ts.IfStatement;
      // inline span for else if
      return (
        <div style={{ display: true ? "inline" : "block" }}>
          <Keyword>if</Keyword>
          {"("}
          <IndentBlock>
            <BooleanExpectedNode tree={t.expression} />
          </IndentBlock>
          {")"}
          &nbsp;
          {"{"}
          <IndentBlock>
            <Tree tree={t.thenStatement} />
          </IndentBlock>
          {t.elseStatement ? (
            <div>
              {"}"}&nbsp;
              <Keyword>else</Keyword>
              &nbsp;
              {t.elseStatement.kind === ts.SyntaxKind.IfStatement ? (
                <Tree tree={t.elseStatement} />
              ) : (
                <>
                  {"{"}
                  <IndentBlock>
                    <Tree tree={t.elseStatement} />
                  </IndentBlock>
                  {"}"}
                </>
              )}
            </div>
          ) : (
            <>{"}"}</>
          )}
        </div>
      );
    }

    case ts.SyntaxKind.StringLiteral: {
      return (
        <EditableStringLiteral
          stringLiteral={tree as ts.StringLiteral}
          onChangeNode={context.onChangeNode}
        />
      );
    }
    case ts.SyntaxKind.NoSubstitutionTemplateLiteral: {
      return (
        <EditableNoSubstitutionTemplateLiteral
          templateLiteral={tree as ts.NoSubstitutionTemplateLiteral}
          onChangeNode={context.onChangeNode}
        />
      );
    }

    case ts.SyntaxKind.NumericLiteral: {
      return (
        <EditableNumericLiteral
          numericLiteral={tree as ts.NumericLiteral}
          onChangeNode={context.onChangeNode}
        />
      );
    }

    case ts.SyntaxKind.TrueKeyword:
    case ts.SyntaxKind.FalseKeyword:
    case ts.SyntaxKind.BooleanKeyword: {
      return (
        <EditableBooleanLiteral
          booleanLiteral={tree as ts.BooleanLiteral}
          onChangeNode={context.onChangeNode}
        />
      );
    }

    default: {
      return <CodeRenderer tree={tree} />;
    }
  }
}

const fontSize = 18;
const padding = 3;

function getLiteralWidth(len: number) {
  return padding * 2 + len * 11;
}

export function EditableIdentifier({
  identifier,
  onChangeNode,
}: {
  identifier: ts.Identifier;
  onChangeNode: (prev: ts.Identifier, next: ts.Identifier) => void;
}) {
  return (
    <Input
      value={identifier.text}
      style={{
        width: `${getLiteralWidth(identifier.text.length)}px`,
      }}
      onChange={(ev) => {
        const value = ev.target.value;
        ev.target.style.width = `${getLiteralWidth(value.length)}px`;
        const newNode = ts.factory.createIdentifier(value);
        onChangeNode(identifier, newNode);
      }}
    />
  );
}

function EditableNoSubstitutionTemplateLiteral({
  templateLiteral,
  onChangeNode,
}: {
  templateLiteral: ts.NoSubstitutionTemplateLiteral;
  onChangeNode: (
    prev: ts.NoSubstitutionTemplateLiteral,
    next: ts.NoSubstitutionTemplateLiteral
  ) => void;
}) {
  // const { root } = useRendererContext();
  // const raw = templateLiteral.getFullText(root);
  return (
    <>
      {"`"}
      <div>
        <Textarea
          style={{
            width: "100%",
            minHeight: "120px",
          }}
          value={templateLiteral.text}
          onChange={(ev: any) => {
            const value = ev.target.value;
            // const newNode = ts.getMutableClone(templateLiteral);
            // newNode.text = value;
            onChangeNode(
              templateLiteral,
              ts.createNoSubstitutionTemplateLiteral(value)
            );
          }}
        />
      </div>
      {"`"}
    </>
  );
}

function EditableStringLiteral({
  stringLiteral,
  onChangeNode,
}: {
  stringLiteral: ts.StringLiteral;
  onChangeNode: (prev: ts.StringLiteral, next: ts.StringLiteral) => void;
}) {
  return (
    <>
      {'"'}
      <Input
        value={stringLiteral.text}
        style={{
          color: "#ce9178",
          width: `${getLiteralWidth(stringLiteral.text.length)}px`,
        }}
        onChange={(ev: any) => {
          const value = ev.target.value;
          ev.target.style.width = `${getLiteralWidth(
            stringLiteral.text.length
          )}px`;
          const newNode = ts.getMutableClone(stringLiteral);
          newNode.text = value;
          onChangeNode(stringLiteral, newNode);
        }}
      />
      {'"'}
    </>
  );
}

function EditableNumericLiteral({
  numericLiteral,
  onChangeNode,
}: {
  numericLiteral: ts.NumericLiteral;
  onChangeNode: (prev: ts.NumericLiteral, next: ts.NumericLiteral) => void;
}) {
  return (
    <>
      <Input
        type="number"
        value={numericLiteral.text}
        style={{
          color: "#ce9178",
          width: `${getLiteralWidth(numericLiteral.text.length) + 16}px`,
        }}
        onChange={(ev: any) => {
          const value = Number(ev.target.value) as number;
          ev.target.style.width = `${
            getLiteralWidth(numericLiteral.text.length) + 16
          }px`;
          const newNode = ts.getMutableClone(numericLiteral);
          newNode.text = value.toString();
          onChangeNode(numericLiteral, newNode);
        }}
      />
    </>
  );
}

function EditableJsxText({
  jsxText,
  onChangeNode,
}: {
  jsxText: ts.JsxText;
  onChangeNode: (prev: ts.JsxText, next: ts.JsxText) => void;
}) {
  return (
    <>
      <Input
        value={jsxText.text}
        style={{
          width: `${getLiteralWidth(jsxText.text.length)}px`,
        }}
        onChange={(ev) => {
          const value = ev.target.value;
          ev.target.style.width = `${getLiteralWidth(jsxText.text.length)}px`;
          const newNode = ts.getMutableClone(jsxText);
          newNode.text = value;
          onChangeNode(jsxText, newNode);
        }}
      />
    </>
  );
}

function EditableBooleanLiteral({
  booleanLiteral,
  onChangeNode,
}: {
  booleanLiteral: ts.BooleanLiteral;
  onChangeNode: (prev: ts.BooleanLiteral, next: ts.BooleanLiteral) => void;
}) {
  return (
    <>
      <select
        value={
          booleanLiteral.kind === ts.SyntaxKind.TrueKeyword ? "true" : "false"
        }
        onChange={(ev) => {
          const value = ev.target.value as "true" | "false";
          onChangeNode(
            booleanLiteral,
            value === "true" ? ts.createTrue() : ts.createFalse()
          );
        }}
      >
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    </>
  );
}

function EditableSourceFile({ sourceFile }: { sourceFile: ts.SourceFile }) {
  const { context, renderer: Renderer } = useRendererContext<EditableContext>();
  return (
    <>
      {sourceFile.statements.map((stmt, key) => {
        return <Renderer tree={stmt} key={key} />;
      })}
      <AppendStatementsToolbar
        onAppend={(stmts) => {
          const newStmts = sourceFile.statements.concat(stmts);
          context.onUpdateSource(newStmts);
        }}
      />
    </>
  );
}

function EditableBlock({
  block,
  onChangeNode,
}: {
  block: ts.Block;
  onChangeNode: (prev: ts.Block, next: ts.Block) => void;
}) {
  const { renderer: Renderer } = useRendererContext<EditableContext>();
  return (
    <>
      {block.statements.map((stmt, key) => {
        return <Renderer tree={stmt} key={key} />;
      })}
      <AppendStatementsToolbar
        onAppend={(stmts) => {
          const newStmts = block.statements.concat(stmts);
          onChangeNode(block, ts.createBlock(newStmts));
        }}
      />
    </>
  );
}

function AppendStatementsToolbar({
  onAppend,
}: {
  onAppend: (newStatements: ts.NodeArray<ts.Statement>) => void;
}) {
  const [appending, setAppending] = useState("");
  const append = useCallback(
    (code: string) => {
      if (code.length > 0) {
        const ret = ts.createSourceFile(
          "file:///__expr__.ts",
          code,
          ts.ScriptTarget.Latest,
          /*setParentNodes*/ false,
          ts.ScriptKind.TSX
        );
        onAppend(ret.statements);
        setAppending("");
      }
    },
    [appending, onAppend]
  );
  return (
    <div>
      <div style={{ display: "flex", width: "100%" }}>
        <div style={{ flex: 1, height: 26 }}>
          <Textarea
            value={appending}
            style={{ width: "100%", height: 26 }}
            onChange={(ev) => {
              const value = ev.target.value;
              setAppending(value);
            }}
            onKeyDown={(ev) => {
              if (ev.key === "Enter") {
                ev.preventDefault();
                append(appending);
              }
            }}
          />
        </div>
        <div>
          <button
            onClick={(ev) => {
              ev.preventDefault();
              // @ts-ignore
              ev.target.blur?.();
              append(appending);
            }}
          >
            Enter
          </button>
        </div>
      </div>
    </div>
  );
}

enum BooleanExpectedNodeType {
  BinaryExpression = "binary-expression",
  Boolean = "boolean",
  Expression = "expression",
}

function getCurrentBooleanExpectedType(
  kind: ts.SyntaxKind
): BooleanExpectedNodeType {
  switch (kind) {
    case ts.SyntaxKind.BinaryExpression: {
      return BooleanExpectedNodeType.BinaryExpression;
    }
    case ts.SyntaxKind.FalseKeyword:
    case ts.SyntaxKind.TrueKeyword: {
      return BooleanExpectedNodeType.Boolean;
    }
    default: {
      return BooleanExpectedNodeType.Expression;
    }
  }
}

function BooleanExpectedNode({ tree }: { tree: ts.Expression }) {
  const { renderer: Tree, context } = useRendererContext<EditableContext>();
  const nodeType = getCurrentBooleanExpectedType(tree.kind);

  // const [nodeType, setNodeType] = useState<BooleanExpectedNodeType>(
  //   getCurrentBooleanExpectedType(tree.kind)
  // );
  const onChangeKind = useCallback(
    (ev: any) => {
      console.log(ev.target.value);
      const newNodeType = ev.target.value as BooleanExpectedNodeType;
      // setNodeType(ev.target.value as BooleanExpectedNodeType);
      switch (newNodeType) {
        case BooleanExpectedNodeType.Boolean: {
          return context.onChangeNode(tree, ts.createTrue());
        }
        case BooleanExpectedNodeType.BinaryExpression: {
          return context.onChangeNode(
            tree,
            ts.createBinary(
              ts.createNumericLiteral(1),
              ts.SyntaxKind.GreaterThanToken,
              ts.createNumericLiteral(0)
            )
          );
        }
      }
      // replaceNode(root, tree,  ts. )
    },
    [nodeType, tree]
  );

  return (
    <div style={{ outline: "1px solid yellow", width: "100%" }}>
      <div>
        {"/* "}
        <select value={nodeType} onChange={onChangeKind}>
          {[
            BooleanExpectedNodeType.BinaryExpression,
            BooleanExpectedNodeType.Boolean,
            BooleanExpectedNodeType.Expression,
          ].map((nodeType) => {
            return (
              <option key={nodeType} value={nodeType}>
                {nodeType}
              </option>
            );
          })}
        </select>
        {" */"}
      </div>
      <Tree tree={tree} />
    </div>
  );
}

function CommentBlock() {}

const Input = styled.input.attrs({
  autoComplete: "off",
  spellcheck: "false",
})`
  background: #222;
  color: #eee;
  border: none;
  outline: none;
  min-width: 0.5em;
  padding: ${padding}px;
  font-size: ${fontSize}px;
  box-sizing: border-box;
  /* outline: 1px solid #ccc; */
  border-bottom: 1px solid yellow;
  font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, Courier,
    monospace;
`;

const Textarea = styled.textarea.attrs({
  autoComplete: "off",
  spellcheck: "false",
})`
  white-space: pre-wrap;
  background: #222;
  color: #eee;
  box-sizing: border-box;
  border: 1px dashed yellow;
  /* outline: 1px solid black; */
  outline: none;
  min-width: 0.5em;
  padding: ${padding}px;
  font-size: ${fontSize}px;
  box-sizing: border-box;
  /* outline: 1px solid #ccc; */
  /* border-bottom: 1px solid #ccc; */
  font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, Courier,
    monospace;
`;

{
  /* <MonacoEditor
                // width="800"
                // height="600"
                language="typescript"
                theme="vs-dark"
                value={appending}
                options={{
                  lineNumbers: "off",
                  minimap: { enabled: false },
                  fontSize: 18,
                  glyphMargin: false,
                }}
                onChange={(value) => {
                  setAppending(value);
                  // TODO: Resize Editor
                }}
                editorDidMount={(editor) => {
                  editor.layout();
                  const m = editor.getModel();
                  m?.updateOptions({ tabSize: 2 });
                  console.log("mounted");
                }}
              /> */
}

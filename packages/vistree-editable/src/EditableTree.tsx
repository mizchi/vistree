import React, { useState, useCallback } from "react";
import ts from "typescript";
import styled from "styled-components";

import {
  VisualTree,
  CodeRenderer,
  useRendererContext,
} from "@mizchi/vistree/src";

type EditableContext = { onChangeNode: (prev: ts.Node, next: ts.Node) => void };

export function EditableTree(props: {
  ast: ts.SourceFile;
  onChangeNode: (prev: ts.Node, next: ts.Node) => void;
}) {
  return (
    <VisualTree
      renderer={EditableRenderer}
      root={props.ast}
      context={{ onChangeNode: props.onChangeNode }}
    />
  );
}

function EditableRenderer({ tree }: { tree: ts.Node }) {
  const { context } = useRendererContext<EditableContext>();
  switch (tree.kind) {
    // case ts.SyntaxKind.Identifier: {
    //   return (
    //     <EditableIdentifier
    //       identifier={tree as ts.Identifier}
    //       onChangeNode={context.onChangeNode}
    //     />
    //   );
    // }
    case ts.SyntaxKind.SourceFile:
    case ts.SyntaxKind.Block: {
      return (
        <EditableBlock
          block={tree as ts.Block}
          onChangeNode={context.onChangeNode}
        />
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

function EditableBlock({
  block,
  onChangeNode,
}: {
  block: ts.Block | ts.SourceFile;
  onChangeNode: (
    prev: ts.Block | ts.SourceFile,
    next: ts.Block | ts.SourceFile
  ) => void;
}) {
  const [showGuide, setShowGuide] = useState(false);

  const [appending, setAppending] = useState("");
  const addStatement = useCallback(
    (code: string) => {
      if (code.length > 0) {
        const ret = ts.createSourceFile(
          "file:///__expr__.ts",
          code,
          ts.ScriptTarget.Latest,
          /*setParentNodes*/ false,
          ts.ScriptKind.TSX
        );
        const newStmts = block.statements.concat(ret.statements);
        if (block.kind === ts.SyntaxKind.Block) {
          onChangeNode(block, ts.createBlock(newStmts));
        }
        // How I add statements to source?
        // else if (block.kind === ts.SyntaxKind.SourceFile) {
        // }
        setAppending("");
      }
    },
    [appending, block]
  );

  return (
    <>
      <CodeRenderer tree={block} />
      {block.kind === ts.SyntaxKind.Block && (
        <div>
          <div style={{ display: "flex", width: "100%" }}>
            <div style={{ flex: 1, height: "18px" }}>
              <Textarea
                value={appending}
                style={{ width: "100%", height: 26 }}
                onFocus={() => setShowGuide(true)}
                // onBlur={() => setShowGuide(false)}
                onChange={(ev) => {
                  const value = ev.target.value;
                  setAppending(value);
                }}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter") {
                    ev.preventDefault();
                    // @ts-ignore
                    ev.target.blur?.();

                    addStatement(appending);
                    setAppending("");
                    setShowGuide(false);
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
                  addStatement(appending);
                  setAppending("");
                  setShowGuide(false);
                }}
              >
                Enter
              </button>
            </div>
          </div>
          {showGuide && (
            <div>
              <button
                onClick={(ev) => {
                  addStatement("for(const i of []) {}");
                }}
              >
                for of
              </button>
              <button
                onClick={(ev) => {
                  addStatement("if(true) {}");
                }}
              >
                if
              </button>

              <button
                onClick={(ev) => {
                  addStatement("if(true) {} else {}");
                }}
              >
                if else
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

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

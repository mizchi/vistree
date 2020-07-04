import React from "react";
import ts from "typescript";
import styled from "styled-components";

import {
  RootRenderer,
  VisualCodeTree,
  useRendererContext,
} from "../../../src/Tree";

type EditableContext = { onChangeNode: (prev: ts.Node, next: ts.Node) => void };

export function EditableTree(props: {
  ast: ts.SourceFile;
  onChangeNode: (prev: ts.Node, next: ts.Node) => void;
}) {
  return (
    <RootRenderer
      Renderer={EditableRenderer}
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
      return <VisualCodeTree tree={tree} />;
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
        onChangeNode(identifier, ts.createIdentifier(value));
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
          onChangeNode(stringLiteral, ts.createStringLiteral(value));
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
          onChangeNode(numericLiteral, ts.createNumericLiteral(value));
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
          onChangeNode(jsxText, ts.createJsxText(value));
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
  border-bottom: 1px solid #ccc;
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
  border: 1px dashed white;
  outline: 1px solid black;
  min-width: 0.5em;
  padding: ${padding}px;
  font-size: ${fontSize}px;
  box-sizing: border-box;
  /* outline: 1px solid #ccc; */
  /* border-bottom: 1px solid #ccc; */
  font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, Courier,
    monospace;
`;

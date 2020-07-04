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
    case ts.SyntaxKind.Identifier: {
      return (
        <EditableIdentifier
          identifier={tree as ts.Identifier}
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

const Input = styled.input.attrs({
  autoComplete: "off",
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

export function EditableStringLiteral({
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
  onChangeNode: (prev: ts.JsxText, next: ts.JsxText) => void;
}) {
  return (
    <>
      <select>
        <option>true</option>
        <option>false</option>
      </select>
    </>
  );
}

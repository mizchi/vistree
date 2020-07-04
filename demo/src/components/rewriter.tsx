import ts from "typescript";
import React from "react";

export function EditableIdentifier({
  identifier,
  onChangeNode,
}: {
  identifier: ts.Identifier;
  onChangeNode: (prev: ts.Identifier, next: ts.Identifier) => void;
}) {
  return (
    <input
      value={identifier.text}
      style={{
        background: "#222",
        color: "#eee",
        border: "none",
        outline: "1px solid #ccc",
        fontFamily:
          "SFMono-Regular,Consolas,Liberation Mono,Menlo,Courier,monospace",
        width: `${identifier.text.length * 8 + 6}px`,
      }}
      onChange={(ev) => {
        const value = ev.target.value;
        ev.target.style.width = `${value.length * 8 + 6}px`;
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
      <input
        value={stringLiteral.text}
        style={{
          background: "#222",
          color: "#eee",
          border: "none",
          outline: "1px solid #ccc",
          fontFamily:
            "SFMono-Regular,Consolas,Liberation Mono,Menlo,Courier,monospace",
          width: `${stringLiteral.text.length * 8 + 6}px`,
        }}
        onChange={(ev) => {
          const value = ev.target.value;
          ev.target.style.width = `${value.length * 8 + 6}px`;
          onChangeNode(stringLiteral, ts.createStringLiteral(value));
        }}
      />
      {'"'}
    </>
  );
}

export function EditableJsxText({
  jsxText,
  onChangeNode,
}: {
  jsxText: ts.JsxText;
  onChangeNode: (prev: ts.JsxText, next: ts.JsxText) => void;
}) {
  return (
    <>
      <input
        value={jsxText.text}
        style={{
          background: "#222",
          color: "#eee",
          border: "none",
          outline: "1px solid #ccc",
          fontFamily:
            "SFMono-Regular,Consolas,Liberation Mono,Menlo,Courier,monospace",
          width: `${jsxText.text.length * 8 + 6}px`,
        }}
        onChange={(ev) => {
          const value = ev.target.value;
          ev.target.style.width = `${value.length * 8 + 6}px`;
          onChangeNode(jsxText, ts.createJsxText(value));
        }}
      />
    </>
  );
}

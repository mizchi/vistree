import React, { Suspense, useCallback, useState } from "react";
import ts from "typescript";
import { RootTree } from "./Tree";
import type * as monaco from "monaco-editor";
import { astToCode } from "../worker/typescript.worker";
import { format } from "../worker/prettier.worker";
import code from "!!raw-loader!./Tree.tsx";
import { parseTypeScript, rewriteAst } from "../helper/tsHelper";
import { Layout } from "../components/Layout";

const MonacoEditor = React.lazy(() => import("../components/MonacoEditor"));
const initialCode = code;

export function App() {
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
      const newAst = rewriteAst(ast, prev, next);
      setAst(newAst);
      console.time("print");
      const newCode = await astToCode(newAst as ts.SourceFile);
      console.timeEnd("print");
      console.time("format");
      const newCodeFormatted = await format(newCode);
      console.timeEnd("format");
      setCode(newCodeFormatted);
      setCheckpointCode(newCodeFormatted);
    },
    [code, ast]
  );

  const replaceNode = useCallback(
    (tree: ts.Node) => {
      // if (tree.kind === ts.SyntaxKind.Identifier) {
      //   return (
      //     <EditableIdentifier
      //       identifier={tree as ts.Identifier}
      //       onChangeNode={onChangeNode}
      //     />
      //   );
      // }
      if (tree.kind === ts.SyntaxKind.StringLiteral) {
        return (
          <EditableStringLiteral
            stringLiteral={tree as ts.StringLiteral}
            onChangeNode={onChangeNode}
          />
        );
      }
      // if (tree.kind === ts.SyntaxKind.JsxText) {
      //   return (
      //     <EditableJsxText
      //       jsxText={tree as ts.JsxText}
      //       onChangeNode={onChangeNode}
      //     />
      //   );
      // }
    },
    [onChangeNode]
  );

  return (
    <Layout
      left={
        <Suspense fallback="loading...">
          <MonacoEditor
            initialCode={checkpointCode}
            onChange={onChangeCode}
            onInit={onInit}
          />
        </Suspense>
      }
      right={
        <RootTree
          root={ast}
          onChangeNode={onChangeNode}
          replaceNode={replaceNode}
        />
      }
    />
  );
}

function EditableIdentifier({
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

function EditableJsxText({
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

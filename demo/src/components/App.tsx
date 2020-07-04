import React, { Suspense, useCallback, useState, useEffect } from "react";
import ts from "typescript";
import type * as monaco from "monaco-editor";
import { astToCode } from "../worker/typescript.worker";
import { format } from "../worker/prettier.worker";

// lib
import { RootTree } from "../../../src/Tree";
import { parseCode, rewriteAst } from "../../../src/helper/tsHelper";
import { Scrollable, HeaderContainer, Root, ContentContainer } from "./layout";
import { EditableStringLiteral } from "./rewriter";
import { TEMPLATES } from "../data";

const MonacoEditor = React.lazy(() => import("./MonacoEditor"));

enum EditMode {
  CodeAndVisual = "code-and-visual",
  Code = "code",
  Visual = "visual",
}

// @ts-ignore
const initialCode = TEMPLATES[Object.keys(TEMPLATES)[0]];
const initialAst = parseCode(initialCode);
export function App() {
  const [mode, setMode] = useState<EditMode>(EditMode.CodeAndVisual);
  const [code, setCode] = useState<string>(initialCode);
  const [ast, setAst] = useState<ts.SourceFile>(initialAst);
  const [checkpointCode, setCheckpointCode] = useState<string>(code);
  const [
    editor,
    setEditor,
  ] = useState<null | monaco.editor.IStandaloneCodeEditor>(null);

  const onInit = useCallback((ed) => {
    setEditor(ed);
  }, []);

  const onChangeCode = useCallback((value: string) => {
    if (mode === EditMode.CodeAndVisual) {
      const ast = parseCode(value);
      setAst(ast);
    }
  }, []);

  const onChangeAst = useCallback(
    async (prev: ts.Node, next: ts.Node) => {
      const newAst = rewriteAst(ast, prev, next);
      setAst(newAst);
      if (mode === EditMode.CodeAndVisual) {
        const newCode = await printCodeWithFormat(newAst);
        setCode(newCode);
        setCheckpointCode(newCode);
      }
    },
    [ast, mode]
  );

  const replaceNode = useCallback(
    (tree: ts.Node) => {
      if (tree.kind === ts.SyntaxKind.Identifier) {
        return (
          <EditableIdentifier
            identifier={tree as ts.Identifier}
            onChangeNode={onChangeAst}
          />
        );
      }
      if (tree.kind === ts.SyntaxKind.StringLiteral) {
        return (
          <EditableStringLiteral
            stringLiteral={tree as ts.StringLiteral}
            onChangeNode={onChangeAst}
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
    [onChangeAst, mode]
  );

  const onChangeMode = useCallback(
    async (newMode: EditMode) => {
      if (mode === EditMode.Code) {
        // Code => AST
        const newAst = parseCode(code);
        setAst(newAst);
      } else if (mode === EditMode.Visual) {
        // AST => Code
        const newCode = await printCodeWithFormat(ast as ts.SourceFile);
        setCode(newCode);
        setCheckpointCode(newCode);
      }
      setMode(newMode);
    },
    [mode, ast, code]
  );

  const onChangeCodeTemplate = useCallback(
    async (newCode: string) => {
      setCode(newCode);
      setCheckpointCode(newCode);

      const newAst = parseCode(newCode);
      setAst(newAst);
    },
    [code]
  );

  return (
    <Root>
      <HeaderContainer>
        <Header
          mode={mode}
          onChangeMode={onChangeMode}
          onChangeCodeTemplate={onChangeCodeTemplate}
        />
      </HeaderContainer>
      <ContentContainer>
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "row",
          }}
        >
          {[EditMode.Code, EditMode.CodeAndVisual].includes(mode) && (
            <div style={{ flex: 1, maxWidth: "100%", height: "100%" }}>
              <Suspense fallback="loading...">
                <MonacoEditor
                  initialCode={checkpointCode}
                  onChange={onChangeCode}
                  onInit={onInit}
                />
              </Suspense>
            </div>
          )}
          {[EditMode.Visual, EditMode.CodeAndVisual].includes(mode) && (
            <div
              style={{
                flex: 1,
                maxWidth: "100%",
                height: "100%",
                position: "relative",
              }}
            >
              <Scrollable>
                <RootTree
                  root={ast}
                  onChangeNode={onChangeAst}
                  replaceNode={replaceNode}
                />
              </Scrollable>
            </div>
          )}
        </div>
      </ContentContainer>
    </Root>
  );
}

function Header(props: {
  mode: EditMode;
  onChangeMode: (mode: EditMode) => void;
  onChangeCodeTemplate: (code: string) => void;
}) {
  const onClickVisualAndCode = useCallback(
    () => props.onChangeMode(EditMode.CodeAndVisual),
    []
  );
  const onClickVisual = useCallback(
    () => props.onChangeMode(EditMode.Visual),
    []
  );
  const onClickCode = useCallback(() => props.onChangeMode(EditMode.Code), []);

  return (
    <div style={{ display: "flex" }}>
      <div>
        {/* <button disabled={props.mode === EditMode.Code} onClick={onClickCode}>
          code[Ctrl-1]
        </button>
        <button
          disabled={props.mode === EditMode.Visual}
          onClick={onClickVisual}
        >
          visual[Ctrl-2]
        </button>
        <button
          disabled={props.mode === EditMode.CodeAndVisual}
          onClick={onClickVisualAndCode}
        >
          both[Ctrl-3]
        </button> */}
      </div>
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
        <div>
          <select
            onChange={(ev) => {
              const target = ev.target.value as keyof typeof TEMPLATES;
              props.onChangeCodeTemplate(TEMPLATES[target]);
            }}
          >
            {Object.keys(TEMPLATES).map((filepath) => {
              return (
                <option key={filepath} value={filepath}>
                  {filepath}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    </div>
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

async function printCodeWithFormat(ast: ts.SourceFile) {
  const newCode = await astToCode(ast);
  const newCodeFormatted = await format(newCode);
  return newCodeFormatted;
}

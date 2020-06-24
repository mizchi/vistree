import * as monaco from "monaco-editor";
import { format } from "../prettier.worker";
import React, { useEffect, useRef } from "react";

monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  jsx: monaco.languages.typescript.JsxEmit.React,
  jsxFactory: "React.createElement",
  reactNamespace: "React",
  allowNonTsExtensions: true,
  allowJs: true,
  typeRoots: ["./types"],
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  allowSyntheticDefaultImports: true,
  target: monaco.languages.typescript.ScriptTarget.Latest,
});

monaco.languages.registerDocumentFormattingEditProvider("typescript", {
  async provideDocumentFormattingEdits(model) {
    const text = await format(model.getValue());
    debugger;
    return [
      {
        range: model.getFullModelRange(),
        text,
      },
    ];
  },
});
monaco.languages.typescript.typescriptDefaults.addExtraLib(
  `declare module "*";`,
  "file:///decls.d.ts"
);

const el = document.querySelector("#root") as HTMLElement;
const model = monaco.editor.createModel(
  "",
  "typescript",
  monaco.Uri.parse("file:///index.tsx")
);
model.updateOptions({
  tabSize: 2,
});

export default function MonacoEditor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      const editor = monaco.editor.create(el, {
        model,
        language: "typescript",
        lineNumbers: "off",
        roundedSelection: false,
        scrollBeyondLastLine: false,
        readOnly: false,
        fontSize: 18,
        theme: "vs-dark",
        minimap: {
          enabled: false,
        },
      });
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
        editor.getAction("editor.action.formatDocument").run();
      });
    }
  }, [ref]);
  return <div ref={ref}></div>;
}

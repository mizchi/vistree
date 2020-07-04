import * as monaco from "monaco-editor";
import { format } from "../worker/prettier.worker";
import React, { useEffect, useRef, useState } from "react";
import { loadDtsFiles } from "../monacoHelper";

declare var ResizeObserver: any;

monaco.languages.typescript.typescriptDefaults.getEagerModelSync();
monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  jsx: monaco.languages.typescript.JsxEmit.React,
  allowNonTsExtensions: true,
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  allowSyntheticDefaultImports: true,
  target: monaco.languages.typescript.ScriptTarget.Latest,
});

const importMap = {
  imports: {
    react: "https://cdn.jsdelivr.net/npm/react@16.9.0/index.js",
    "react-dom": "https://cdn.jsdelivr.net/npm/react-dom@16.9.0/index.js",
    typescript:
      "https://cdn.jsdelivr.net/npm/typescript@4.0.0-dev.20200628/lib/typescript.js",
  },
  types: {
    react: {
      "index.d.ts":
        "https://cdn.jsdelivr.net/npm/@types/react@16.9.0/index.d.ts",
      "global.d.ts":
        "https://cdn.jsdelivr.net/npm/@types/react@16.9.0/global.d.ts",
    },
    "react-dom":
      "https://cdn.jsdelivr.net/npm/@types/react-dom@16.9.0/index.d.ts",
    typescript:
      "https://cdn.jsdelivr.net/npm/typescript@4.0.0-dev.20200628/lib/typescript.d.ts",
  },
};

loadDtsFiles(monaco, importMap.types);

monaco.languages.typescript.typescriptDefaults.addExtraLib(
  `declare module "*";`,
  "file:///decls.d.ts"
);

monaco.languages.registerDocumentFormattingEditProvider("typescript", {
  async provideDocumentFormattingEdits(model) {
    const text = await format(model.getValue());
    return [
      {
        range: model.getFullModelRange(),
        text,
      },
    ];
  },
});

export default React.memo(function MonacoEditor(props: {
  initialCode: string;
  onChange: (value: string) => void;
  onInit: (editor: monaco.editor.IStandaloneCodeEditor) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [
    editor,
    setEditor,
  ] = useState<null | monaco.editor.IStandaloneCodeEditor>(null);
  useEffect(() => {
    if (ref.current) {
      let model = monaco.editor.getModels().find((t) => {
        return t.uri.path === "/index.tsx";
        // console.log(t.uri.path);
      });
      if (model == null) {
        model = monaco.editor.createModel(
          props.initialCode,
          "typescript",
          monaco.Uri.parse("file:///index.tsx")
        );
        model.updateOptions({ tabSize: 2 });
      }

      const editor = monaco.editor.create(ref.current, {
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
      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S,
        async () => {
          editor.getAction("editor.action.formatDocument").run();
        }
      );
      editor.onDidChangeModelContent(() => {
        props.onChange(editor.getValue());
      });
      setEditor(editor);
      props.onInit(editor);

      // layouting
      editor.layout();
      const resizeObserver = new ResizeObserver((entries: any) => {
        editor.layout();
      });
      resizeObserver.observe(ref.current);
      return () => resizeObserver.unobserve(ref.current);
    }
  }, [ref]);
  useEffect(() => {
    if (editor) {
      editor.setValue(props.initialCode);
    }
  }, [props.initialCode, editor]);
  return <div ref={ref} style={{ height: "100%", width: "100%" }}></div>;
});

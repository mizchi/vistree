import * as monaco from "monaco-editor";
import { format } from "../worker/prettier.worker";
import React, { useEffect, useRef, useState } from "react";
declare var ResizeObserver: any;

monaco.languages.typescript.typescriptDefaults.getEagerModelSync();
monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  jsx: monaco.languages.typescript.JsxEmit.React,
  allowNonTsExtensions: true,
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  allowSyntheticDefaultImports: true,
  target: monaco.languages.typescript.ScriptTarget.Latest,
});

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

monaco.languages.typescript.typescriptDefaults.addExtraLib(
  `declare module "*";`,
  "file:///decls.d.ts"
);

// async function getTypeScriptService() {
//   const getWorker = await monaco.languages.typescript.getTypeScriptWorker();
//   const worker = await getWorker(monaco.Uri.parse("file:///index.tsx"));
//   return worker;
// }

// ----------------------

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
  // useEffect(() => {
  // }, [props.initialCode]);
  useEffect(() => {
    if (ref.current) {
      const model = monaco.editor.createModel(
        props.initialCode,
        "typescript",
        monaco.Uri.parse("file:///index.tsx")
      );
      model.updateOptions({ tabSize: 2 });

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
      return () => {};
    }
  }, [ref]);
  useEffect(() => {
    if (editor) {
      editor.setValue(props.initialCode);
    }
  }, [props.initialCode, editor]);
  return <div ref={ref} style={{ height: "100%", width: "100%" }}></div>;
});

import type * as monaco_ from "monaco-editor";

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

// @ts-ignore
globalThis.MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  }
}

export async function loadDtsFiles(
  monaco: typeof monaco_,
  typesMap: { [k: string]: string | object }
) {
  const filesToDownload: Array<{ local: string; url: string }> = [];
  Object.entries(typesMap).forEach(async ([pkgName, filepath_or_filemap]) => {
    if (typeof filepath_or_filemap === "string") {
      const local = `file:///node_modules/@types/${pkgName}/index.d.ts`;
      filesToDownload.push({
        local,
        url: filepath_or_filemap,
      });
    } else {
      Object.entries(filepath_or_filemap).forEach(async ([path, url]) => {
        const local = `file:///node_modules/@types/${pkgName}/${path}`;
        filesToDownload.push({ local, url });
      });
    }
  });

  const files: Array<{ local: string; content: string }> = await Promise.all(
    filesToDownload.map(async (def) => {
      const text = await fetch(def.url).then((res) => res.text());
      return {
        local: def.local,
        content: text,
      };
    })
  );

  files.map((file) => {
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      file.content,
      file.local
    );
  });
}

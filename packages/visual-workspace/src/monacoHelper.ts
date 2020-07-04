import type * as monaco_ from "monaco-editor";

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

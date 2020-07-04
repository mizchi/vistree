// import React from "react";
// import ts from "typescript";

// import {
//   VisualCodeTree,
//   useRendererContext,
//   // @ts-ignore
// } from "visual-code-tree";

// type EditableContext = {};

// export function SimpleTree() {
//   const ast = ts.createSourceFile(
//     "/index.ts",
//     'export const x: string = "hello";',
//     ts.ScriptTarget.Latest
//   );
//   return <RootRenderer Renderer={Renderer} root={ast} context={{}} />;
// }

// // Render tree recursively.
// function Renderer({ tree }: { tree: ts.Node }) {
//   const { context } = useRendererContext<EditableContext>();
//   switch (tree.kind) {
//     case ts.SyntaxKind.StringLiteral: {
//       const t = tree as ts.StringLiteral;
//       return <span style={{ color: "red" }}>{t.text} as string</span>;
//     }
//     default: {
//       return <VisualCodeTree tree={tree} />;
//     }
//   }
// }

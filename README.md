# vistree

Visual TypeScript Editing Environment.

Edit code editor and visual editor each other.

## Philosophy and Goal

Today's no-code and low-code miss visual programming infastructure. All visual programming environments have turing complete semantics, after all.

So as first step of visual programming, we need ast editor and generate both code and UI from it.

TypeScript is best choice for general purpose like web(ui) and backend(node.js).

## packages

- `@mizchi/vistree`: Code Renderer
- `@mizchi/vistree-editable`: Code Renderer with editable UI
- `workspace`: Playground of `@mizchi/vistree-editable`

## Development

```
yarn install
yarn build
yarn dev
```

## Deploy

```
# Install netlify
yarn deploy
```

---

# @mizchi/vistree

visual code editor infrastructure.

## Install

```bash
npm install @mizchi/viztree typescript react react-dom styled-components --save
```

## Example

Simple code renderer.

```tsx
import React from "react";
import ts from "typescript";

import { VisualTree, CodeRenderer, useRendererContext } from "@mizchi/viztree";

type EditableContext = {};

export function SimpleTree() {
  const source = ts.createSourceFile(
    "/index.ts",
    'export const x: string = "hello";',
    ts.ScriptTarget.Latest
  );
  return <VisualTree Renderer={Renderer} root={source} context={{}} />;
}

// Render tree recursively.
function Renderer({ tree }: { tree: ts.Node }) {
  // get context
  const { context } = useRendererContext<EditableContext>();
  switch (tree.kind) {
    case ts.SyntaxKind.StringLiteral: {
      const t = tree as ts.StringLiteral;
      return <span style={{ color: "red" }}>{t.text} as string</span>;
    }
    default: {
      return <CodeRenderer tree={tree} />;
    }
  }
}
```

## TODO

- [ ] else if
- [x] BinaryExpression
- [x] Export
- [x] Export Default
- [x] Import
- [x] Class
- [x] Object Literal
- [x] Arrow Function
- [x] Interface
- [x] TypeParameters
- [x] Generics
- [x] class implements
- [x] `import { a as b }`
- [x] ObjectBindingPattern `const {} = {}`
- [x] ArrayBindingPattern `const {} = {}`
- [x] `foo!`
- [x] monorepo

## Icebox

- [ ] decolator
- [ ] generator

## Inspired by...

- https://arcade.makecode.com/
- [microsoft/pxt\-blockly: Blockly \(Microsoft MakeCode fork\)](https://github.com/microsoft/pxt-blockly)
- [harukamm/ocaml\-blockly: OCaml visual programming editor based on Blockly\.](https://github.com/harukamm/ocaml-blockly)

## LICENSE

MIT

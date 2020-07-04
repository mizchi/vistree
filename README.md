# visual-typescript-tree

## packages

- vistree
- vistree-editable
- workspace

## What's this?

Render typescript ast.

## Install

```bash
npm install react react-dom visual-typescript-tree typescript --save
# or
yarn add react react-dom visual-typescript-tree typescript
```

## Example

Simple code renderer.

```tsx
import React from "react";
import ts from "typescript";

import {
  VisualTree,
  CodeRenderer,
  useRendererContext,
  // @ts-ignore
} from "visual-typescript-tree";

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

## Icebox

- [ ] decolator
- [ ] generator

## LICENSE

MIT

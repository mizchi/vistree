import ts from "typescript";

export function parseCode(value: string) {
  console.time("parse");
  const ret = ts.createSourceFile(
    "file:///index.ts",
    value,
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ false,
    ts.ScriptKind.TSX
  );
  console.timeEnd("parse");
  return ret;
}

export function rewriteSource(
  ast: ts.SourceFile,
  prev: ts.Node,
  next: ts.Node
) {
  function rewriter(): ts.TransformerFactory<ts.Node> {
    return (context) => {
      const visit: ts.Visitor = (node) => {
        const isSameNode = node.kind === prev.kind && node.pos === prev.pos;
        if (isSameNode) {
          return next;
        }
        return ts.visitEachChild(node, (child) => visit(child), context);
      };
      return (node) => ts.visitNode(node, visit);
    };
  }
  const result = ts.transform(ast, [rewriter()]);
  const newAst = result.transformed[0] as ts.SourceFile;
  return newAst;
}

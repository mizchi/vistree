import ts from "typescript";
const source = `
  const tw: number = 2;
  const four = 4;
`;

function numberTransformer<T extends ts.Node>(): ts.TransformerFactory<T> {
  return (context) => {
    const visit: ts.Visitor = (node) => {
      if (ts.isIdentifier(node)) {
        console.log(node);
        return ts.createIdentifier(node.text + "_xxx");
        // return ts.createStringLiteral(node.text);
      }
      return ts.visitEachChild(node, (child) => visit(child), context);
    };
    return (node) => ts.visitNode(node, visit);
  };
}

let result = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
  transformers: { before: [numberTransformer()] },
});

console.log(result.outputText);

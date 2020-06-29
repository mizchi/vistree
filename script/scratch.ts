import ts from "typescript";
const sourceCode = `
  const two: number = 2;
  const four = 4;
`;

const source = ts.createSourceFile(
  "file:///index.ts",
  sourceCode,
  ts.ScriptTarget.Latest,
  /*setParentNodes*/ false,
  ts.ScriptKind.TSX
);

function numberTransformer<T extends ts.Node>(): ts.TransformerFactory<T> {
  return (context) => {
    const visit: ts.Visitor = (node) => {
      if (ts.isIdentifier(node)) {
        // console.log(node);
        return ts.createIdentifier(node.text + "_xxx");
        // return ts.createStringLiteral(node.text);
      }
      return ts.visitEachChild(node, (child) => visit(child), context);
    };
    return (node) => ts.visitNode(node, visit);
  };
}

let result = ts.transform(source, [numberTransformer()]);
// compilerOptions: { module: ts.ModuleKind.CommonJS },
//   transformers: { before: [numberTransformer()] },
// });

const printer = ts.createPrinter();
console.log(printer.printFile(result.transformed[0] as ts.SourceFile));

// console.log(result.transformed[0]);

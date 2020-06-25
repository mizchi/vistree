import * as ts from "typescript";

export async function getTypeScript() {
  return ts;
}

// ast builder
export function makeFactorialFunction() {
  const functionName = ts.createIdentifier("factorial");
  const paramName = ts.createIdentifier("n");
  const parameter = ts.createParameter(
    /*decorators*/ undefined,
    /*modifiers*/ undefined,
    /*dotDotDotToken*/ undefined,
    paramName
  );

  const condition = ts.createBinary(
    paramName,
    ts.SyntaxKind.LessThanEqualsToken,
    ts.createLiteral(1)
  );
  const ifBody = ts.createBlock(
    [ts.createReturn(ts.createLiteral(1))],
    /*multiline*/ true
  );

  const decrementedArg = ts.createBinary(
    paramName,
    ts.SyntaxKind.MinusToken,
    ts.createLiteral(1)
  );
  const recurse = ts.createBinary(
    paramName,
    ts.SyntaxKind.AsteriskToken,
    ts.createCall(functionName, /*typeArgs*/ undefined, [decrementedArg])
  );
  const statements = [ts.createIf(condition, ifBody), ts.createReturn(recurse)];

  return ts.createFunctionDeclaration(
    /*decorators*/ undefined,
    /*modifiers*/ [ts.createToken(ts.SyntaxKind.ExportKeyword)],
    /*asteriskToken*/ undefined,
    functionName,
    /*typeParameters*/ undefined,
    [parameter],
    /*returnType*/ ts.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
    ts.createBlock(statements, /*multiline*/ true)
  );
}

export function run() {
  const resultFile = ts.createSourceFile(
    "someFileName.ts",
    "",
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ false,
    ts.ScriptKind.TS
  );
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  const result = printer.printNode(
    ts.EmitHint.Unspecified,
    makeFactorialFunction(),
    resultFile
  );
  console.log(result);
}

export function showAst(code: string) {
  const file = ts.createSourceFile(
    "file:///index.ts",
    code,
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ false,
    ts.ScriptKind.TS
  );

  // console.log(file);
  walk(file);

  function walk(node: ts.Node) {
    console.log(node, node.kind);
    ts.forEachChild(node, walk);
  }
  // debugger;

  // file.forEachChild()

  // const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  // printer.printNode(ts.EmitHint.Unspecified, )
  // const result = printer.printNode(
  //   ts.EmitHint.Unspecified,
  //   makeFactorialFunction(),
  //   resultFile
  // );
  // console.log(result);
}

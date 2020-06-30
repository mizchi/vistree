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

export async function astToCode(source: ts.SourceFile) {
  const printer = ts.createPrinter();
  return printer.printFile(source);
}

import * as ts from "typescript";

export async function getTypeScript() {
  return ts;
}

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

export function showAst() {
  const sourceFile = ts.createSourceFile(
    "someFileName.ts",
    `if(true){console.log(1);}`,
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ false,
    ts.ScriptKind.TS
  );
  walk(sourceFile);
  // console.log(sourceFile.statements);

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
  function report(node: ts.Node, message: string) {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(
      node.getStart()
    );
    console.log(
      `${sourceFile.fileName} (${line + 1},${character + 1}): ${message}`
    );
  }
  function walk(node: ts.Node) {
    console.log(node.kind);
    // switch (node.kind) {
    //   case ts.SyntaxKind.ForStatement:
    //   case ts.SyntaxKind.ForInStatement:
    //   case ts.SyntaxKind.WhileStatement:
    //   case ts.SyntaxKind.DoStatement: {
    //     console.log(node);
    //   }
    //   case ts.SyntaxKind.IfStatement: {
    //     console.log("if", node);
    //     // const ifStatement = node as ts.IfStatement;
    //     // if (ifStatement.thenStatement.kind !== ts.SyntaxKind.Block) {
    //     //   report(
    //     //     ifStatement.thenStatement,
    //     //     "An if statement's contents should be wrapped in a block body."
    //     //   );
    //     // }
    //     // if (
    //     //   ifStatement.elseStatement &&
    //     //   ifStatement.elseStatement.kind !== ts.SyntaxKind.Block &&
    //     //   ifStatement.elseStatement.kind !== ts.SyntaxKind.IfStatement
    //     // ) {
    //     //   report(
    //     //     ifStatement.elseStatement,
    //     //     "An else statement's contents should be wrapped in a block body."
    //     //   );
    //     // }
    //     // break;
    //   }

    //   // case ts.SyntaxKind.BinaryExpression: {
    //   //   const op = (node as ts.BinaryExpression).operatorToken.kind;
    //   //   if (
    //   //     op === ts.SyntaxKind.EqualsEqualsToken ||
    //   //     op === ts.SyntaxKind.ExclamationEqualsToken
    //   //   ) {
    //   //     report(node, "Use '===' and '!=='.");
    //   //   }
    //   //   break;
    //   // }
    // }
    ts.forEachChild(node, walk);
  }
}

showAst();

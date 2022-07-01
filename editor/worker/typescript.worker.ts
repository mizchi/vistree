import ts from "typescript";

export async function astToCode(source: ts.SourceFile) {
  const printer = ts.createPrinter();
  return printer.printFile(source);
}

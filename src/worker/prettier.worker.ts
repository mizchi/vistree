import prettier from "prettier/standalone";
import ts from "prettier/parser-typescript";

export async function format(str: string) {
  return prettier.format(str, {
    parser: "typescript",
    plugins: [ts],
  });
}

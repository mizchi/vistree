const path = require("path");
const MonacoPlugin = require("monaco-editor-webpack-plugin");
const HtmlPlugin = require("html-webpack-plugin");
module.exports = (_, argv) => {
  return {
    entry: {
      main: path.join(__dirname, "src/index"),
    },
    output: {
      path: path.join(__dirname, "dist"),
    },
    module: {
      rules: [
        {
          test: /\.ttf$/,
          use: ["file-loader"],
        },
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: "ts-loader",
              options: {
                transpileOnly: true,
              },
            },
          ],
        },
        {
          test: /\.worker.ts$/,
          use: [
            {
              loader: "comlink-loader",
              options: {
                singleton: true,
              },
            },
            {
              loader: "ts-loader",
              options: {
                transpileOnly: true,
              },
            },
          ],
        },
        {
          test: /\.css?$/,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    resolve: {
      extensions: [".js", ".ts", ".tsx", ".mjs", ".wasm"],
      alias:
        argv.mode !== "production"
          ? {
              vistree: "vistree/src",
              "vistree-editable": "vistree-editable/src",
            }
          : {},
    },
    plugins: [
      new MonacoPlugin(),
      new HtmlPlugin({
        template: path.join(__dirname, "src/index.html"),
      }),
    ],
  };
};

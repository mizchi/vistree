const MonacoPlugin = require("monaco-editor-webpack-plugin");
const HtmlPlugin = require("html-webpack-plugin");
module.exports = {
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
              // configFile: "webpack.tsconfig.json",
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
  },
  plugins: [
    new MonacoPlugin(),
    new HtmlPlugin({
      template: "src/index.html",
    }),
  ],
};

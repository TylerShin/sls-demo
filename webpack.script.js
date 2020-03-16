const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "development",
  entry: {
    uploadToBlobStorage: "./scripts/uploadToBlobStorage.ts"
  },
  output: {
    libraryTarget: "commonjs",
    path: path.resolve(__dirname, "scripts-dist"),
    filename: "[name].js"
  },
  devtool: false,
  resolve: { extensions: [".ts", ".tsx", ".js", ".jsx"] },
  stats: "errors-only",
  module: {
    rules: [
      {
        test: /\.ts?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              happyPackMode: true,
              onlyCompileBundledFiles: true
            }
          }
        ]
      }
    ]
  },
  target: "node",
  node: {
    __dirname: false,
    __filename: false
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development"
      )
    })
  ]
};

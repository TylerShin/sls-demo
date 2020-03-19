const path = require("path");
const webpack = require("webpack");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const cpuLength = require("os").cpus().length;

module.exports = {
  mode: "development",
  entry: "./src/server/index.tsx",
  output: {
    libraryTarget: "commonjs2",
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js"
  },
  devtool: false,
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      "react-pdf": "react-pdf/dist/esm/entry.webpack",
      "@src": path.resolve(__dirname, "src")
    }
  },
  stats: "errors-only",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          { loader: "cache-loader" },
          {
            loader: "thread-loader",
            options: {
              workers: cpuLength - 1
            }
          },
          {
            loader: "babel-loader?cacheDirectory=true"
          },
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              happyPackMode: true,
              onlyCompileBundledFiles: true
            }
          }
        ]
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "svg-sprite-loader",
            options: { esModule: false }
          },
          "svg-transform-loader",
          "svgo-loader"
        ]
      },
      {
        test: /\.css$/,
        use: ["isomorphic-style-loader", "css-loader"]
      },
      {
        test: /\.scss$/,
        use: [
          { loader: "isomorphic-style-loader" },
          {
            loader: "css-loader",
            options: {
              modules: true,
              localIdentName: "[name]_[local]_[hash:base64:5]"
            }
          },
          {
            loader: "postcss-loader",
            options: {
              plugins: () => {
                return [
                  require("precss"),
                  require("autoprefixer"),
                  require("postcss-flexbugs-fixes")
                ];
              }
            }
          },
          { loader: "sass-loader" },
          {
            loader: "sass-resources-loader",
            options: {
              resources: ["./src/assets/_variables.scss"]
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
      "process.env.TARGET": JSON.stringify("server")
    }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development"
      )
    }),
    new ForkTsCheckerWebpackPlugin({ checkSyntacticErrors: true })
  ]
  // externals: [nodeExternals()]
};

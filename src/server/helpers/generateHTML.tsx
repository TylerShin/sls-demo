import { HelmetData } from "react-helmet";
const sprite = require("svg-sprite-loader/runtime/sprite.build");

interface Params {
  jsx: string;
  linkTags: string;
  styleTags: string;
  scriptTags: string;
  muiCss: string;
  plutoCss: string;
  helmet: HelmetData;
}

export function generateHTML({
  jsx,
  helmet,
  scriptTags,
  linkTags,
  styleTags,
  muiCss,
  plutoCss
}: Params) {
  return `<!doctype html>
<html lang="en">
  <head>
    ${helmet.title.toString()}
    ${helmet.script.toString()}
    ${helmet.meta.toString()}
    ${helmet.link.toString()}
    ${scriptTags}
    ${linkTags}
    ${styleTags}
    <style id="jss-server-side">${muiCss}</style>
    <style>${plutoCss}</style>
  </head>
  <body>
    ${sprite.stringify()}
    <div id="react-app">${jsx}</div>
  </body>
</html>`;
}

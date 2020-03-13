import { HelmetData } from "react-helmet";
const sprite = require("svg-sprite-loader/runtime/sprite.build");

interface Params {
  jsx: string;
  linkTags: string;
  styleTags: string;
  scriptTags: string;
  helmet: HelmetData;
}

export function generateHTML({
  jsx,
  helmet,
  scriptTags,
  linkTags,
  styleTags
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
  </head>
  <body>
    ${sprite.stringify()}
    <div id="react-app">${jsx}</div>
  </body>
</html>`;
}

import React from "react";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ChunkExtractor, ChunkExtractorManager } from "@loadable/server";
import path from "path";
import Routes from "../components/routes";
import { generateHTML } from "./helpers/generateHTML";

const statsFile = path.resolve(__dirname, "assets", "loadable-stats.json");
const extractor = new ChunkExtractor({ statsFile });

const httpTrigger: AzureFunction = async function(
  context: Context,
  req: HttpRequest
): Promise<void> {
  const url = new URL(req.url);
  const jsx = extractor.collectChunks(
    <ChunkExtractorManager extractor={extractor}>
      <StaticRouter location={url.pathname}>
        <div>{JSON.stringify(process.env, null, 2)}</div>
        <div>{url.pathname}</div>
        <Routes />
      </StaticRouter>
    </ChunkExtractorManager>
  );

  const jsxHTML = ReactDOMServer.renderToString(jsx);
  const scriptTags = extractor.getScriptTags();
  const linkTags = extractor.getLinkTags();
  const styleTags = extractor.getStyleTags();
  const helmet = Helmet.renderStatic();

  const html: string = await generateHTML({
    jsx: jsxHTML,
    linkTags,
    styleTags,
    scriptTags,
    helmet
  });

  context.res = {
    headers: { "Content-Type": "text/html; charset=utf-8" },
    body: html
  };
};

export default httpTrigger;

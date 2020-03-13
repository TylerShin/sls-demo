import React from "react";
import ReactDom from "react-dom";
import { BrowserRouter } from "react-router-dom";
import Routes from "../components/routes";

// Prevent IE/Edge's Clicking SVG problem
// https://stackoverflow.com/questions/38648307/add-blur-method-to-svg-elements-in-ie-edge
if (typeof (SVGElement.prototype as any).blur === "undefined") {
  // tslint:disable-next-line:no-empty
  (SVGElement.prototype as any).blur = () => {};
}

const App = (
  <BrowserRouter>
    <Routes />
  </BrowserRouter>
);

ReactDom.hydrate(App, document.getElementById("react-app"));

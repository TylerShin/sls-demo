import React, { FC, useEffect } from "react";
import ReactDom from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@material-ui/core/styles";
import Routes from "../components/routes";
import theme from "../assets/muiTheme";
const StyleContext = require("isomorphic-style-loader/StyleContext");

// Prevent IE/Edge's Clicking SVG problem
// https://stackoverflow.com/questions/38648307/add-blur-method-to-svg-elements-in-ie-edge
if (typeof (SVGElement.prototype as any).blur === "undefined") {
  // tslint:disable-next-line:no-empty
  (SVGElement.prototype as any).blur = () => {};
}

const insertCss = (...styles: any[]) => {
  const removeCss = styles.map(style => style._insertCss());
  return () => removeCss.forEach(dispose => dispose());
};

const App: FC = () => {
  useEffect(() => {
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles && jssStyles.parentElement) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <StyleContext.Provider value={{ insertCss }}>
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
      </StyleContext.Provider>
    </ThemeProvider>
  );
};

ReactDom.hydrate(<App />, document.getElementById("react-app"));

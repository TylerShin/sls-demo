import React, { FC, useEffect } from "react";
import ReactDom from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@material-ui/core/styles";
import App from "../components/app";
import theme from "../assets/muiTheme";
import { Provider } from "react-redux";
import store from "../store";
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

const ClientApp: FC = () => {
  useEffect(() => {
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles && jssStyles.parentElement) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <StyleContext.Provider value={{ insertCss }}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </StyleContext.Provider>
      </Provider>
    </ThemeProvider>
  );
};

ReactDom.hydrate(<ClientApp />, document.getElementById("react-app"));

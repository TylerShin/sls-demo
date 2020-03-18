import React from "react";
import { Switch, Route, useLocation } from "react-router-dom";
import loadable from "@loadable/component";
import { HOME_PATH } from "../../constants/route";
import DefaultHelmet from "../helmet";
import ErrorPage from "../../pages/error/errorPage";

interface RouteMap {
  path?: string;
  component?: any;
  exact?: boolean;
  render?: any;
}

const routesMap: RouteMap[] = [
  {
    path: HOME_PATH,
    exact: true,
    component: loadable(() => import("../../pages/home"), {
      fallback: <div>FAILED TO GET HOME</div>
    })
  },
  { component: ErrorPage }
];

const Routes: React.FC = () => {
  const location = useLocation();

  return (
    <>
      <DefaultHelmet />
      <Switch location={location}>
        {routesMap.map(route => (
          <Route {...route} key={route.path || "errorPage"} />
        ))}
      </Switch>
    </>
  );
};

export default Routes;

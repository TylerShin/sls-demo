import React, { FC } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
const useStyles = require("isomorphic-style-loader/useStyles");
const styles = require("./errorPage.scss");

const ErrorPage: FC = () => {
  useStyles(styles);
  const history = useHistory();
  const { pathname } = useLocation();
  const path = pathname.replace("/", "");
  const errorNum = isNaN(parseInt(path, 10)) ? 404 : parseInt(path, 10);
  const firstNumber = errorNum ? parseInt(String(errorNum).slice(0, 1), 10) : 4;

  console.log(errorNum);

  let errorContent: string;
  switch (firstNumber) {
    case 4:
      if (errorNum === 404) {
        errorContent = "page not found";
      } else {
        errorContent = `${errorNum} request error`;
      }
      break;
    case 5:
      errorContent = "server error";
      break;
    default:
      errorContent = "page not found";
  }

  return (
    <div>
      <div className={styles.errorPageContainer}>
        <div className={styles.errorNum}>{errorNum || 404}</div>
        <div className={styles.errorContent}>{errorContent}</div>
        <div
          onClick={() => {
            history.goBack();
          }}
          className={styles.goBackButton}
        >
          Go Back
        </div>
        <Link to="/" className={styles.homeButton}>
          Home
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;

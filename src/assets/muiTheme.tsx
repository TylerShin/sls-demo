import { createMuiTheme } from "@material-ui/core/styles";

// Create a theme instance.
const theme = createMuiTheme({
  overrides: {
    MuiStepIcon: {
      root: {
        "&$completed": {
          color: "#81acff"
        },
        "&$active": {
          color: "#3e7fff"
        }
      },
      active: {},
      completed: {}
    },
    MuiStepLabel: {
      label: {
        "&$completed": {
          color: "#9aa3b5"
        },
        "&$active": {
          color: "rgba(30, 42, 53, 0.8)"
        }
      }
    }
  }
});

export default theme;

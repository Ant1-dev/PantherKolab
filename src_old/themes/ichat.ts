import { alpha, createTheme } from "@mui/material/styles";

let theme = createTheme({
  palette: {
    primary: {
      main: "#025c4c", //green-ish
      light: "#1daa61",
      dark: "rgba(21, 16, 104,  0.95)",
    },
    secondary: {
      main: "#202020",
    },
  },
  typography: {
    allVariants: {
      fontFamily: ' "Inter", sans-serif',
      color: "white",
    },
    h5: {
      fontWeight: 500,
      fontSize: 26,
      letterSpacing: 0.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiTab: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
  mixins: {
    toolbar: {
      minHeight: 48,
    },
  },
});

theme = {
  ...theme,
  components: {
    MuiGrid: {
      styleOverrides: {
        root: {
          margin: 0,
          padding: 0,
        },

        item: {
          margin: 0,
          padding: "0 !important",
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#081627",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
        contained: {
          boxShadow: "none",
          "&:active": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          marginLeft: theme.spacing(1),
        },
        indicator: {
          height: 3,
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
          backgroundColor: theme.palette.common.white,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          margin: "0 16px",
          minWidth: 0,
          padding: 0,
          [theme.breakpoints.up("md")]: {
            padding: 0,
            minWidth: 0,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: theme.spacing(1),
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 4,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: "rgb(255,255,255,0.15)",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            background: `var(--chat_selected_background) !important`,
          },
          "&.Mui-hover": {
            background: `var(--chat_hover_background) !important`,
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: 14,
          fontWeight: theme.typography.fontWeightMedium,
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: "inherit",
          minWidth: "auto",
          marginRight: theme.spacing(2),
          "& svg": {
            fontSize: 20,
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: alpha(theme.palette.primary.dark, 0.4),
        },
      },
    },

    MuiAvatar: {
      styleOverrides: {
        root: {
          fontFamily: '"Inter", sans-serif',
          fontWeight: 500,
          width: "2.30rem",
          height: "2.30rem",
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          background: "#2727272F",
        },
      },
    },
  },
};

export default theme;

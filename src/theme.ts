import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: `'Bubblegum Sans', cursive`,
    body: `'Poppins', sans-serif`,
  },
  colors: {
    primary: {
      100: "#E0BBE4", // Light purple
      200: "#957DAD", // Deeper purple
      300: "#D291BC", // Soft pink-purple
      400: "#FEC8D8", // Light pink
      500: "#FFDFD3", // Very light pink
    },
    background: "#f7f7fb", // Light background
  },
  styles: {
    global: {
      "html, body": {
        background: "#f7f7fb", // Light background globally
        color: "gray.800",
      },
    },
  },
});

export default theme;

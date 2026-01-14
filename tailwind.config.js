import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "Avenir", "Helvetica", "Arial", "sans-serif"],
      },

      /**
       * Custom exact breakpoints (non-overriding)
       * - Keep Tailwind defaults (sm/md/lg/xl/2xl) intact
       * - Add exact sizes you requested
       */
      screens: {
        m320: "320px",
        m375: "375px",
        m425: "425px",
        w1440: "1440px",
        w2560: "2560px",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["light"],
  },
};

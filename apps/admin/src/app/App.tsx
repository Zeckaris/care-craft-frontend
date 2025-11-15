import { RouterProvider } from "react-router-dom";
import { router } from "@/router";
import "@/styles/index.css";
import { ThemeProvider } from "@/context/ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

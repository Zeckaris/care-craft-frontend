import { RouterProvider } from "react-router-dom";
import { router } from "@/router";
import "@/styles/index.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/context/UserContext";

export default function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </UserProvider>
  );
}

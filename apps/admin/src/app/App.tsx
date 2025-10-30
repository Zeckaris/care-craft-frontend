import AdminSignupPage from "@/features/auth/AdminSignupPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<AdminSignupPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import "./variables.css";
import { ThemeProvider } from "./context/themeContext/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      {" "}
      {/* Добавляем провайдер контекста */}
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
    
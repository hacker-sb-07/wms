import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import Administrator from "./pages/Administrator";
import Reader from "./pages/Reader";
import Publisher from "./pages/Publisher";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/administrator"
          element={<Administrator />}
        />

        <Route
          path="/reader"
          element={<Reader />}
        />

        <Route
          path="/publisher"
          element={<Publisher />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
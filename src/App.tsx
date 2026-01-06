import { Route } from "react-router";
import { Routes } from "react-router";
import { BrowserRouter } from "react-router";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AuthWrapper from "./pages/Wrapper";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*home*/}
        <Route path="/" element={<Home />} />

        {/*register*/}
        <Route path="/register" element={<Register />} />

        {/*login*/}
        <Route path="/login" element={<Login />} />

        {/*dashboard*/}
        <Route
          path="/dashboard"
          element={
            <AuthWrapper>
              <Dashboard />
            </AuthWrapper>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { Route } from "react-router";
import { Routes } from "react-router";
import { BrowserRouter } from "react-router";

import AuthWrapper from "./AuthWrapper";
import Login from "../features/auth/Login";
import Register from "../features/auth/Register";
import Dashboard from "../features/dashboard/Dashboard";
import GroupSplit from "../features/group-split/GroupSplit";
import BaseLayout from "./BaseLayout";
import NotFound from "./NotFound";
import Profile from "@/features/auth/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*register*/}
        <Route path="/register" element={<Register />} />

        {/*login*/}
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <AuthWrapper>
              <BaseLayout />
            </AuthWrapper>
          }
        >
          {/*dashboard*/}
          <Route path="/" element={<Dashboard />} />

          {/*profile*/}
          <Route path="/profile" element={<Profile />} />

          {/*group split*/}
          <Route path="/group-split" element={<GroupSplit groupId={null} />} />
        </Route>

        {/*not found*/}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

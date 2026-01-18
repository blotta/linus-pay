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
import { AuthProvider } from "@/auth/AuthProvider";
import GroupDetails from "@/features/group-split/GroupDetails";
import { GroupSplitProvider } from "@/features/group-split/GroupSplitProvider";

function App() {
  return (
    <AuthProvider>
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
            <Route
              path="/group-split"
              element={
                <GroupSplitProvider>
                  <GroupSplit />
                </GroupSplitProvider>
              }
            >
              <Route path=":groupId" element={<GroupDetails />} />
            </Route>
          </Route>

          {/*not found*/}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "../helper/supabaseClient";
import { Navigate } from "react-router";

interface AuthWrapperProps {
  children: ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setAuthenticated(!!session);
      setLoading(false);
    };

    getSession();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (authenticated) {
    return <>{children}</>;
  }

  return <Navigate to="/login" />;
}

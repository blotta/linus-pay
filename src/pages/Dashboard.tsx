import { useNavigate } from "react-router";
import { supabase } from "../helper/supabaseClient";

export default function Dashboard() {
  const navigate = useNavigate();
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    navigate("/login");
  };
  return (
    <div>
      <h1>Hello, you are logged in.</h1>
      <button onClick={signOut}>Sign out</button>
    </div>
  );
}

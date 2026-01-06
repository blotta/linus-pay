import { useState } from "react";

import { supabase } from "../helper/supabaseClient";
import { Link } from "react-router";
import { useNavigate } from "react-router";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data) {
      navigate("/dashboard");
    }
  };

  return (
    <div>
      <h2>Login</h2>

      {message ? <span>{message}</span> : ""}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          required
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
        <input
          type="password"
          placeholder="Password"
          required
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
        <button type="submit">Log in</button>
      </form>
      <Link to="/register">Don't have an account? Sign up</Link>
    </div>
  );
}

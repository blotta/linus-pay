import { useState } from "react";

import { supabase } from "../helper/supabaseClient";
import { Link } from "react-router";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data) {
      setMessage("User account created!");
    }
  };

  return (
    <div>
      <h2>Register</h2>

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
        <button type="submit">Create Account</button>
      </form>
      <Link to="/login">Already have an account? Log in</Link>
    </div>
  );
}

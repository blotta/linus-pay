import { Link } from "react-router";

// interface HomeProps {
//   propName: type;
// }

export default function Home() {
  return (
    <div>
      <h1>HOME</h1>
      <Link to="register">Register</Link>
      <br />
      <Link to="login">Login</Link>
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from './Config';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Email validation: Correct format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
    if (!email || !email.match(emailRegex)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    // Password validation: Non-empty
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    auth
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        setSuccessMsg('Login successful');
        setEmail('');
        setPassword('');
        setErrorMsg('');
        setTimeout(() => {
          setSuccessMsg('');
          navigate('/');
        }, 3000);
      })
      .catch((err) => setErrorMsg(err.message));
  };

  return (
    <div className="container">
      <br />
      <br />
      <h1>Login</h1>
      <hr />
      {successMsg && <div className="success-msg">{successMsg}</div>}
      <form className="form-group" autoComplete="off" onSubmit={handleLogin}>
        <label>Email</label>
        <input
  type="email"
  className="form-control"
  required
  maxLength={32}
  onChange={(e) => setEmail(e.target.value)}
  value={email}
/>
        <br />
        <label>Password</label>
        <input
          type="password"
          className="form-control"
          required
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
        <br />
        {errorMsg && <div className="error-msg">{errorMsg}</div>}
        <div className="btn-box">
          <span>
            Don't have an account? <Link to="/signup" className="link">Signup</Link>
          </span>
          <button type="submit" className="btn btn-success btn-md">
            Login
          </button>
        </div>
      </form>
    </div>
  );
};

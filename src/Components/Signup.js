import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, fs } from './Config';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { Navbar } from './Navbar';

const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleSignUp = (e) => {
    e.preventDefault();

    // Name validation: Only alphabets and minimum length of 3
    const nameRegex = /^[A-Za-z]{3,}(?:\s[A-Za-z]+)?$/;


    if (!fullName || !fullName.match(nameRegex)) {
      setErrorMsg(
        'Please enter a valid name (minimum 3 characters, only alphabets and spaces allowed).'
      );
      return;
    }
    // Email validation: Correct format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
    if (!email || !email.match(emailRegex)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    // Password validation: At least 8 characters, at least one uppercase letter, one lowercase letter, one number, and one special character
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!password || !password.match(passwordRegex)) {
      setErrorMsg(
        'Please enter a valid password (at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character).'
      );
      return;
    }

    auth
      .createUserWithEmailAndPassword(email, password)
      .then((cred) => {
        const createdAt = firebase.firestore.Timestamp.fromDate(new Date()); // Get the current timestamp

        fs.collection('SignedUpUsers')
          .doc(cred.user.uid)
          .set({
            Name: fullName,
            Email: email,
            Password: password,
            CreatedAt: createdAt, // Add the created at time to the data
          })
          .then(() => {
            setSuccessMsg('Signup successful, redirecting to login');
            setFullName('');
            setEmail('');
            setPassword('');
            setErrorMsg('');
            setTimeout(() => {
              setSuccessMsg('');
              navigate('/login');
            }, 3000);
          })
          .catch((err) => setErrorMsg(err.message));
      })
      .catch((err) => setErrorMsg(err.message));
  };

  return (
    <div>
    <Navbar  />
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
      <br />
      <br />
      <h1>Signup</h1>
      <hr />
      {successMsg && <div className="success-msg">{successMsg}</div>}
      <form className="form-group" autoComplete="off" onSubmit={handleSignUp}>
        <label>Full Name</label>
        <input
          type="text"
          className="form-control"
          required
          pattern="[A-Za-z ]{3,}"
          title="Please enter a valid name (minimum 3 alphabets, only alphabets allowed)."
          onChange={(e) => setFullName(e.target.value)}
          value={fullName}
        />
        <br />
        <label>Email</label>
        <input
          type="email"
          className="form-control"
          required
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
        <br />
        <label>Password</label>
        <input
          type="password"
          className="form-control"
          required
          pattern="^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$"
          title="Please enter a valid password (at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character)."
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
        <br />
        <div className="btn-box">
          <span>
            Already have an account? <Link to="/login" className="link">Login</Link>
          </span>
          <button type="submit" className="btn btn-success btn-md">
            Signup
          </button>
        </div>
      </form>
      {errorMsg && <div className="error-msg">{errorMsg}</div>}
    </div>
    </div>
      </div>
      </div>
  );
};

export default Signup;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('login-page');
    return () => {
      document.body.classList.remove('login-page');
    };
  }, []);

  const validateLogin = (e) => {
    e.preventDefault();

    if (username === 'admin' && password === '1234') {
      localStorage.setItem("loggedIn", true);
      navigate('/');
    } else {
      alert('Incorrect username or password. Please try again.');
    }
  };

  return (
    <div className="login-body">
      <div className="bg-container">
        <div className="container">
          <h1>LOG IN</h1>

          <form id="login-form" onSubmit={validateLogin}>
            <div className="tbox">
              <input
                id="uname"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="tbox">
              <input
                id="pwd"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="glow-btn">
              <div className="btn-glow"></div>
              <button type="submit" className="btn">
                Log In
              </button>
            </div>
          </form>

          <a className="b1" href="#">
            FORGOT PASSWORD?
          </a>
          &nbsp; &nbsp;
          <a className="b2" href="#">
            CREATE AN ACCOUNT
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;

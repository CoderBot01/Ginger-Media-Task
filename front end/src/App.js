import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [age, setAge] = useState('');
  const [dob, setDob] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`http://localhost:3000/getUserDetails/${username}`);
        const userData = await response.json();

        if (response.ok) {
          setUser(userData.user);
          setAge(userData.user.age || '');
          setDob(userData.user.dob || '');
          setContact(userData.user.contact || '');
        } else {
          setMessage(`Error fetching user profile: ${userData.error}`);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setMessage('An error occurred while fetching user profile');
      }
    };

    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Login successful! Welcome, ${data.user.username}`);
      } else {
        setMessage(`Login failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setMessage('An error occurred during login');
    }
  };

  const handleEditProfile = async () => {
    try {
      const response = await fetch(`http://localhost:3000/editUserDetails/${username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword, newEmail, newAge: age, newDob: dob, newContact: contact }),
      });

      const data = await response.json();

      if (response.ok) {
        window.alert('Profile updated successfully');
      } else {
        setMessage(`Error updating profile: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('An error occurred while updating profile');
    }
  };

  const handleSignup = async () => {
    try {
      const response = await fetch('http://localhost:3000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email }),
      });

      const data = await response.json();

      if (response.ok) {
        window.alert('Signup successful! Proceed to login');
        window.location.reload(); // Refresh the page
      } else {
        setMessage(`Signup failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error during signup:', error);
      setMessage('An error occurred during signup');
    }
  };

  const toggleForm = () => {
    setShowLogin((prev) => !prev);
    setMessage('');
  };

  return (
    <main>
      {user ? (
        <div>
          <h1>Welcome, {user.username}!</h1>
          <p>Email: {user.email}</p>
          <p>Age: {age}</p>
          <p>Date of Birth: {dob}</p>
          <p>Contact: {contact}</p>
          <h2>Edit Profile</h2>
          <div>
            <label htmlFor="newPassword">New Password:</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="newEmail">New Email:</label>
            <input
              type="text"
              id="newEmail"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="newAge">New Age:</label>
            <input
              type="text"
              id="newAge"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="newDob">New Date of Birth:</label>
            <input
              type="text"
              id="newDob"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="newContact">New Contact:</label>
            <input
              type="text"
              id="newContact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>
          <button type="button" onClick={handleEditProfile}>
            Update Profile
          </button>
        </div>
      ) : (
        <div>
          <div className="form-toggle">
            <button type="button" onClick={toggleForm}>
              {showLogin ? 'Sign Up' : 'Log In'}
            </button>
          </div>

          {showLogin ? (
            <div>
              <h1>Login Page</h1>
              <form>
                <label htmlFor="username">Username:</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />

                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button type="button" onClick={handleLogin}>
                  Login
                </button>
              </form>
            </div>
          ) : (
            <div>
              <h1>Signup Page</h1>
              <form>
                <label htmlFor="username">Username:</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />

                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <label htmlFor="email">Email:</label>
                <input
                  type="text"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <button type="button" onClick={handleSignup}>
                  Signup
                </button>
              </form>
            </div>
          )}

          {message && <p>{message}</p>}
        </div>
      )}
    </main>
  );
}

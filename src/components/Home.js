import React, { useState } from 'react';
import { auth } from './firebase'; // Ensure correct import for Firebase
import { useNavigate } from 'react-router-dom';
import Form from './Form'; // Import the Form component
import './home.css'; // Add your CSS file for styling

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeComponent, setActiveComponent] = useState(null); // Track the active component
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/'); // Redirect to login page
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Function to handle setting the active component
  const showComponent = (component) => {
    setActiveComponent(component);
  };

  return (
    <div>
      {/* Desktop Navbar */}
      <nav className="navbar">
        <div className="navbar-logo">
          <img
            src="https://cts-tex.com/wp-content/uploads/2022/12/Comhome-Logo-e1677767236209.png"
            alt="Logo"
          />
        </div>
        <ul className="navbar-links">
          <li>
            <button
              onClick={() => showComponent('home')}
              className="navbar-link"
            >
              Home
            </button>
          </li>
          <li>
            <button
              onClick={() => showComponent('form')}
              className="navbar-link"
            >
              Form
            </button>
          </li>
          <li>
            <button
              onClick={() => showComponent('selling')}
              className="navbar-link"
            >
              Selling Product
            </button>
          </li>
          <li>
            <button
              onClick={() => showComponent('buying')}
              className="navbar-link"
            >
              Buying Product
            </button>
          </li>
        </ul>
        <div className="navbar-logout">
          <button onClick={handleLogout} className="navbar-link">
            Logout
          </button>
        </div>
      </nav>

      {/* Content Division */}
      <div className="Content">
        {activeComponent === 'form' && <Form />} {/* Show Form Component */}
        {activeComponent === 'home' && <h2>Welcome to Home Page</h2>} {/* Example Home */}
        {activeComponent === 'selling' && <h2>Selling Product Page</h2>} {/* Example Selling */}
        {activeComponent === 'buying' && <h2>Buying Product Page</h2>} {/* Example Buying */}
      </div>

      {/* Bottom Navbar for Mobile */}
      <nav className="bottom-navbar">
        <button
          onClick={() => showComponent('home')}
          className="bottom-navbar-link"
        >
          Home
        </button>
        <button
          onClick={() => showComponent('form')}
          className="bottom-navbar-link"
        >
          Form
        </button>
        <button
          onClick={() => showComponent('selling')}
          className="bottom-navbar-link"
        >
          Selling
        </button>
        <button
          onClick={() => showComponent('buying')}
          className="bottom-navbar-link"
        >
          Buying
        </button>
      </nav>
    </div>
  );
};

export default Navbar;

import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';
import Form from './Form';
import Selling from './Selling';
import LocalData from './LocalData';
import Address from './Address';
import Order from './Order';
import Scanner from './Scanner';
import '../CSS/home.css';
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { getAuth } from "firebase/auth";

const Navbar = () => {
  const [activeComponent, setActiveComponent] = useState(null);
  const [, setProducts] = useState([]);
  const navigate = useNavigate();
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [showPopup, setShowPopup] = useState(false); // Moved here

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) return;

        const userId = currentUser.uid;
        const docRef = doc(db, `users/${userId}/profilePic/image`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUploadedImageUrl(docSnap.data().profilePic);
        }
      } catch (error) {
        console.error("Error fetching profile image:", error.message);
      }
    };

    fetchProfileImage();
  }, []);

  useEffect(() => {
    const savedComponent = localStorage.getItem('activeComponent');
    if (savedComponent) {
      setActiveComponent(savedComponent);
    } else {
      setActiveComponent('home');
    }
  }, []);

  useEffect(() => {
    if (activeComponent) {
      localStorage.setItem('activeComponent', activeComponent);
    }
  }, [activeComponent]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.clear();
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const confirmLogout = () => {
    setShowPopup(true);
  };

  const cancelLogout = () => {
    setShowPopup(false);
  };

  const showComponent = (component) => {
    setActiveComponent(component);
  };

  return (
    <div>
      {/* Desktop Navbar */}
      <nav className="navbar">
        <div className="navbar-logo">
          <img src="logo.png" alt="Logo" />
        </div>
        <ul className="navbar-links">
          <li>
            <button onClick={() => showComponent('home')} className={`navbar-link ${activeComponent === 'home' ? 'active' : ''}`}>
              Home
            </button>
          </li>
          <li>
            <button onClick={() => showComponent('form')} className={`navbar-link ${activeComponent === 'form' ? 'active' : ''}`}>
              Form
            </button>
          </li>
          <li>
            <button onClick={() => showComponent('selling')} className={`navbar-link ${activeComponent === 'selling' ? 'active' : ''}`}>
              Selling Product
            </button>
          </li>
          <li>
            <button onClick={() => showComponent('buying')} className={`navbar-link ${activeComponent === 'buying' ? 'active' : ''}`}>
              Order
            </button>
          </li>
          <li>
            <button onClick={() => showComponent('Scanner')} className={`navbar-link ${activeComponent === 'Scanner' ? 'active' : ''}`}>
              Scanner
            </button>
          </li>
        </ul>
        
        <div className="navbar-logout">
          <img src={uploadedImageUrl || "user.png"} alt="Profile" className="profile-image" />
          <div className="dropdown">
            <ul className="dropdown-list">
              <li>
                <button onClick={() => showComponent('Address')} className={`drop-link ${activeComponent === 'Address' ? 'active' : ''}`}>
                  Profile
                </button>
              </li>
              <li>
                <button onClick={confirmLogout} className="log-link">
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {showPopup && (
        <div className="popup-overlay">
          <div className="log-box">
            <p>Want to Logout?</p>
            <p>Form Commodity Trading System CTS</p>
            <div className="log-buttons">
              <button className="yes-btn" onClick={handleLogout}>Yes</button>
              <button className="no-btn" onClick={cancelLogout}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* Content Division */}
      <div className="Content">
        {activeComponent === 'form' && <Form />}
        {activeComponent === 'home' && <LocalData />}
        {activeComponent === 'selling' && <Selling />}
        {activeComponent === 'buying' && <Order />}
        {activeComponent === 'Address' && <Address />}
        {activeComponent === 'Scanner' && <Scanner />}
      </div>

      {/* Bottom Navbar for Mobile */}
      <nav className="bottom-navbar">
        <button onClick={() => showComponent('home')} className={`bottom-navbar-link ${activeComponent === 'home' ? 'active' : ''}`}>
          Home
        </button>
        <button onClick={() => showComponent('form')} className={`bottom-navbar-link ${activeComponent === 'form' ? 'active' : ''}`}>
          Form
        </button>
        <button onClick={() => showComponent('selling')} className={`bottom-navbar-link ${activeComponent === 'selling' ? 'active' : ''}`}>
          Selling
        </button>
        <button onClick={() => showComponent('buying')} className={`bottom-navbar-link ${activeComponent === 'buying' ? 'active' : ''}`}>
          Buying
        </button>
        <button onClick={() => showComponent('Scanner')} className={`bottom-navbar-link ${activeComponent === 'Scanner' ? 'active' : ''}`}>
          Scanner
        </button>
      </nav>
    </div>
  );
};

export default Navbar;

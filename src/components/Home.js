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
  const [,setProducts] = useState([]); 
  const navigate = useNavigate();
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  
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

  const showComponent = (component) => {
    setActiveComponent(component);
  };

  const fetchProducts = async () => {
    try {
      const authData = JSON.parse(localStorage.getItem('authLocal')); // Make sure this key is correct
      if (authData && authData.uid) {
        const response = await fetch(`/api/products?uid=${authData.uid}`);
        if (response.ok) {
          const result = await response.json();
          setProducts(result.products);
        } else {
          console.error('Failed to fetch products:', response.statusText);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };
  

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div>
      {/* Desktop Navbar */}
      <nav className="navbar">
        <div className="navbar-logo">
          <img
            src="logo.png"
            alt="Logo"
          />
        </div>
        <ul className="navbar-links">
          <li>
            <button
              onClick={() => showComponent('home')}
              className={`navbar-link ${activeComponent === 'home' ? 'active' : ''}`}
            >
              Home
            </button>
          </li>
          <li>
            <button
              onClick={() => showComponent('form')}
              className={`navbar-link ${activeComponent === 'form' ? 'active' : ''}`}
            >
              Form
            </button>
          </li>
          <li>
            <button
              onClick={() => showComponent('selling')}
              className={`navbar-link ${activeComponent === 'selling' ? 'active' : ''}`}
            >
              Selling Product
            </button>
          </li>
          <li>
            <button
              onClick={() => showComponent('buying')}
              className={`navbar-link ${activeComponent === 'buying' ? 'active' : ''}`}
            >
              Order
            </button>
          </li>
          <li>
            <button
              onClick={() => showComponent('Scanner')}
              className={`navbar-link ${activeComponent === 'Scanner' ? 'active' : ''}`}
            >
              Scanner
            </button>
          </li>
          <li>
            <button
              onClick={() => showComponent('Address')}
              className={`navbar-link ${activeComponent === 'Address' ? 'active' : ''}`}
            >
             Profile  
            </button>
          </li>
        </ul>
        <div className="navbar-logout">
          <img
          src={uploadedImageUrl || "user.png"}
          alt="Profile"
          className="profile-image"
        />
        <button onClick={handleLogout} className="navbar-link">
            Logout
          </button> 
        </div>
      </nav>

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
        <button
          onClick={() => showComponent('home')}
          className={`bottom-navbar-link ${activeComponent === 'home' ? 'active' : ''}`}
        >
          Home
        </button>
        <button
          onClick={() => showComponent('form')}
          className={`bottom-navbar-link ${activeComponent === 'form' ? 'active' : ''}`}
        >
          Form
        </button>
        <button
          onClick={() => showComponent('selling')}
          className={`bottom-navbar-link ${activeComponent === 'selling' ? 'active' : ''}`}
        >
          Selling
        </button>
        <button
          onClick={() => showComponent('buying')}
          className={`bottom-navbar-link ${activeComponent === 'buying' ? 'active' : ''}`}
        >
          Buying
        </button>
        <button
          onClick={() => showComponent('Scanner')}
          className={`bottom-navbar-link ${activeComponent === 'Scanner' ? 'active' : ''}`}
        >
          Scanner
        </button>
        <button
          onClick={() => showComponent('Address')}
          className={`bottom-navbar-link ${activeComponent === 'Address' ? 'active' : ''}`}
        >
          Profile
        </button>
      </nav>
    </div>
  );
};

export default Navbar;

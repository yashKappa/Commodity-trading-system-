import React, { useState } from 'react';
import { db } from './firebase'; // Ensure your firebase configuration is properly set up here
import { collection, setDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import '../CSS/form.css';
import Error from './Error';

const Form = () => {
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [des, setDes] = useState('');
  const [productImage, setProductImage] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    setProductImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
  
      if (!currentUser) {
        setErrorMessage('No user is currently logged in.');
        startTimer();
        setLoading(false);
        return;
      }
  
      const userId = currentUser.uid;
  
      if (productImage) {
        const reader = new FileReader();
        reader.readAsDataURL(productImage);
  
        reader.onload = async () => {
          const imageUrl = reader.result;
  
          const productId = doc(collection(db, `users/${userId}/products`)).id;
  
          const productData = {
            productId,
            productName,
            price,
            quantity,
            imageUrl,
            des,
            userId, // Add userId to the product data
            createdAt: new Date(),
          };
  
          // Save to the user's products collection
          await setDoc(doc(db, `users/${userId}/products`, productId), productData);
          // Optionally save to a local collection
          await setDoc(doc(db, `local`, productId), productData);
  
          // Reset the form
          setProductName('');
          setPrice('');
          setQuantity('');
          setDes('');
          setProductImage(null);
  
          setSuccessMessage('Product was successfully added.');
          setErrorMessage('');
          startTimer();
          setLoading(false);
        };
  
        reader.onerror = () => {
          setErrorMessage('Error reading the file.');
          setLoading(false);
          startTimer();
        };
      } else {
        setErrorMessage('Please upload an image.');
        setLoading(false);
        startTimer();
      }
    } catch (error) {
      setErrorMessage('Error adding product: ' + error.message);
      setLoading(false);
      startTimer();
    }
  };
  

  const startTimer = () => {
    setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 3000);
  };

  return (
    <div className="pro-contain">
      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <Error message={errorMessage} />}
      <div className="form-container">
        <h2>Product Form</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name:</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Price:</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Quantity:</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea
              type="text"
              value={des}
              onChange={(e) => setDes(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Product Image:</label>
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              required
            />
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <span>
                <img
                  src="loading.gif"
                  alt="Loading..."
                  style={{ width: '20px', marginRight: '10px', verticalAlign: 'middle' }}
                />
                Submitting...
              </span>
            ) : (
              'Submit'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Form;

import React, { useState } from 'react';
import { db } from './firebase';  
import { collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './form.css';
import Error from './Error';

const Form = () => {
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [productImage, setProductImage] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleImageChange = (e) => {
    setProductImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setErrorMessage('No user is currently logged in.');
        startTimer();
        return;
      }

      const userId = currentUser.uid;

      let imageUrl = null;
      if (productImage) {
        const reader = new FileReader();
        reader.readAsDataURL(productImage);
        reader.onload = async () => {
          imageUrl = reader.result; 
          
          const productData = {
            productName,
            price,
            quantity,
            imageUrl,
            createdAt: new Date(),
          };

          
          await addDoc(collection(db, `users/${userId}/products`), productData);
          await addDoc(collection(db, `local/`), productData);

          
          setProductName('');
          setPrice('');
          setQuantity('');
          setProductImage(null);

          setSuccessMessage('Product was successfully added.');
          setErrorMessage('');
          startTimer();
        };
      }
    } catch (error) {
      setErrorMessage('Error adding product: ' + error.message);
      setSuccessMessage('');
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
    <div className='contain'>
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
            <label>Product Image:</label>
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              required
            />
          </div>
          <button type="submit" className="submit-btn">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Form;

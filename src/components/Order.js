import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { QRCodeCanvas } from 'qrcode.react';
import '../CSS/order.css';

const Order = () => {
  const [soldProducts, setSoldProducts] = useState([]);
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSection, setSelectedSection] = useState('sold');
  const [userId, setUserId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUserId(currentUser.uid);
      } else {
        setError('No user is currently logged in.');
        setUserId(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchOrderProducts = async () => {
      try {
        setLoading(true);

        const soldSnapshot = await getDocs(collection(db, `users/${userId}/soldProducts`));
        setSoldProducts(soldSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const purchasedSnapshot = await getDocs(collection(db, `users/${userId}/purchasedProducts`));
        setPurchasedProducts(purchasedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        setError('Error fetching orders: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderProducts();
  }, [userId]);

  const handleSectionToggle = (section) => {
    setSelectedSection(section);
    setSelectedProduct(null);
    localStorage.setItem('selectedSection', section); // Store selected section
  };

  const handleBack = () => {
    const lastSection = localStorage.getItem('selectedSection') || 'purchased';
    setSelectedSection(lastSection); // Restore last selected section
    setSelectedProduct(null); // Clear selected product
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const filteredProducts = (selectedSection === 'sold' ? soldProducts : purchasedProducts).filter(product =>
    product.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="order-container">
      <h2>Product Buy and Sell Details</h2>
      <input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      <div className="section-toggle">
        <button onClick={() => handleSectionToggle('sold')}>Sold Products</button>
        <button onClick={() => handleSectionToggle('purchased')}>Purchased Products</button>
      </div>
      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <div className="loading-container">
          <p className="msg">
            <img src='loading.gif' alt='loading' />
            <div>Loading product details...</div>
          </p>
        </div>
      ) : (
        selectedProduct ? (
          <div className="product-details-section">
            <div className='back'>
              <button onClick={handleBack} className="back-button">Back</button>
            </div>
            <div className='back-btn'>
              <button onClick={handleBack} className="back-but">Back</button>
            </div>
            <h2 className='he'>Product Buy and Sell Details</h2>
            <h3 className='head'>
              {selectedSection === 'sold' ? 'Sold Product Details' : 'Purchased Product Details'}
            </h3>
            <div className='fit'>
              <div className="details">
                <img
                  src={selectedProduct.imageUrl ? selectedProduct.imageUrl : 'default-placeholder-image-url'}
                  alt={selectedProduct.productName}
                  className="product-image"
                />
                <div className='data'>
                  <strong>{selectedProduct.productName}</strong>
                  <div className='sub-data'>
                    <p><span>Price:</span> ₹{selectedProduct.price}</p>
                    <p><span>Quantity:</span> {selectedProduct.quantity}</p>
                    <p><span>Total Price:</span> ₹{selectedProduct.totalPrice}</p>
                    <p><span>Payment Method:</span> {selectedProduct.paymentMethod}</p>
                    <p><span>Date:</span> {new Date(selectedProduct.date).toLocaleDateString()}</p>
                  </div>
                </div>
                {/* Display Address in Structured Format */}
                <div className="ad">
                  <p><strong>Address</strong></p>
                  <div className='sub-data'>
                    <p>{selectedProduct.address?.Resident}</p>
                    <p>{selectedProduct.address?.street} {selectedProduct.address?.location}</p>
                    <p>{selectedProduct.address?.city} - {selectedProduct.address?.zipCode}</p>
                    <p>{selectedProduct.address?.state} {selectedProduct.address?.country}</p>
                    <p>{selectedProduct.address?.Contact}</p>
                  </div>
                </div>
                {selectedProduct.qrCode && (
                  <div className='ad'>
                    <p><strong>Scan QR code after delivery</strong></p>
                  <div className='scan-data'>
                    <QRCodeCanvas value={JSON.stringify(JSON.parse(selectedProduct.qrCode), null, 2)} size={150} />
                  </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="order-list">
            {filteredProducts.length === 0 ? (
              <p>No products found</p>
            ) : (
              filteredProducts.map(product => (
                <div key={product.id} className="order-card" onClick={() => handleProductClick(product)}>
                  <img src={product.imageUrl || 'default-placeholder-image-url'} alt={product.productName} className="product-image" />
                  <h4>{product.productName}</h4>
                  <p>Price: ₹{product.price}</p>
                  <p>Quantity: {product.quantity}</p>
                </div>
              ))
            )}
          </div>
        )
      )}
    </div>
  );
};

export default Order;

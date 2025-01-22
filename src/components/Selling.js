import React, { useState, useEffect } from 'react';
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import './selling.css';

const Selling = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProducts = async () => {
      try {
        setLoading(true); // Set loading to true when data fetching starts
        await setPersistence(getAuth(), browserSessionPersistence);

        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) {
          setError('No user is currently logged in.');
          setLoading(false); // End loading state
          return;
        }

        const userId = currentUser.uid;
        const productsCollection = collection(db, `users/${userId}/products`);
        const productsSnapshot = await getDocs(productsCollection);
        const productsList = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(productsList);
        setFilteredProducts(productsList);
      } catch (error) {
        setError('Error fetching products: ' + error.message);
      } finally {
        setLoading(false); // End loading state
      }
    };

    fetchUserProducts();
  }, []);

  useEffect(() => {
    let filtered = products.filter(product =>
      product.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (priceFilter !== 'all') {
      filtered = filtered.filter(product => {
        const price = parseFloat(product.price);
        if (priceFilter === 'low') return price < 100;
        if (priceFilter === 'medium') return price >= 100 && price <= 500;
        if (priceFilter === 'high') return price > 500;
        return true;
      });
    }

    setFilteredProducts(filtered);
  }, [searchTerm, products, priceFilter]);

  return (
    <div className="selling-container">
      <h2>Your Products</h2>
      {error && <p className="error-message">{error}</p>}

      <input
        type="text"
        placeholder="Search products..."
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="price-filter-section">
        <p className="filter-label">Price Filter</p>
        <div className="price-filter-buttons">
          <button
            className={`filter-button ${priceFilter === 'all' ? 'active' : ''}`}
            onClick={() => setPriceFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-button ${priceFilter === 'low' ? 'active' : ''}`}
            onClick={() => setPriceFilter('low')}
          >
            Low
          </button>
          <button
            className={`filter-button ${priceFilter === 'medium' ? 'active' : ''}`}
            onClick={() => setPriceFilter('medium')}
          >
            Medium
          </button>
          <button
            className={`filter-button ${priceFilter === 'high' ? 'active' : ''}`}
            onClick={() => setPriceFilter('high')}
          >
            High
          </button>
        </div>
      </div>

      {loading ? ( // Show loading spinner below the price filter section
        <div className="loading-container">
          <p>Loading products...</p>
        </div>
      ) : (
        <div className="products-list">
          {filteredProducts.length === 0 ? (
            <p className="msg">No products found</p>
          ) : (
            filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <img
                  src={product.imageUrl ? product.imageUrl : 'default-placeholder-image-url'}
                  alt={product.productName}
                  className="product-image"
                />
                <h3>{product.productName}</h3>
                <p>Price: ₹{product.price}</p>
                <p>Quantity: {product.quantity}</p>
                <p>Added On: {new Date(product.createdAt.seconds * 1000).toDateString()}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Selling;

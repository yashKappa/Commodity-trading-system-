import React, { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { collection, getDocs } from 'firebase/firestore';
import './local.css';

const LocalData = ({ userId }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchLocalData = async () => {
      try {
        setLoading(true); // Start loading
        const querySnapshot = await getDocs(collection(db, `local/`));
        const productList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productList);
        setFilteredProducts(productList); 
      } catch (error) {
        console.error("Error fetching local data: ", error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchLocalData();
  }, [userId]);

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
    <div className="local-data-container">
      <h2>Your Local Products</h2>
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
      {loading ? (
        <p className="msg">Loading products...</p> // Display loading message
      ) : (
        filteredProducts.length > 0 ? (
          <div className="grid-container">
            {filteredProducts.map(product => (
              <div className="grid-item" key={product.id}>
                <img src={product.imageUrl} alt={product.productName} />
                <h3>{product.productName}</h3>
                <p>Price: {product.price}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="msg">No products match your search or filter criteria.</p>
        )
      )}
    </div>
  );
};

export default LocalData;

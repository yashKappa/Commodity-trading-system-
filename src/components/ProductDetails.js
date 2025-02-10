import React, { useState, useEffect } from 'react';
import { db } from './firebase'; // Import Firebase configuration
import { doc, getDoc, collection, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import '../CSS/ProDetail.css';

// Modal component to show messages
const Modal = ({ message, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <p>{message}</p>
        <div className='btn'>
          <button onClick={onClose}>Ok</button>
        </div>
      </div>
    </div>
  );
};

const Modern = ({ message, onClose }) => {
  return (
    <div className="Modern-overlay">
      <div className="Modern">
        <div className="message-container">
          <h2>Order Confirmed</h2>
          <p>{message}</p>
        </div>

        {/* Ok Button */}
        <div className="button-container">
          <button
            onClick={() => {
              onClose();
              window.location.reload(); // Reload the page after the message is closed
            }}
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  );
};


const ProductDetails = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [userId, setUserId] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [modalMessage, setModalMessage] = useState(''); // State for modal message
  const [modernMessage, setModernMessage] = useState(''); // State for modal message
  const [isUploading, setIsUploading] = useState(false);



  // Fetch user ID and addresses on authentication state change
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchUserAddresses(user.uid);
      } else {
        setUserId(null);
        setAddresses([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch user addresses from Firestore
  const fetchUserAddresses = async (uid) => {
    try {
      const querySnapshot = await getDocs(collection(db, `users/${uid}/addresses`));
      const fetchedAddresses = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAddresses(fetchedAddresses);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  // Fetch product details from Firestore
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const productDoc = await getDoc(doc(db, `local/${productId}`));
        if (productDoc.exists()) {
          setProduct({ id: productDoc.id, ...productDoc.data() });
          setSelectedQuantity(1);
        } else {
          setModalMessage('No product found with the provided ID');
        }
      } catch (error) {
        setModalMessage('Error fetching product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  // Handle "Buy Product" click
  const handleBuyClick = () => {
    if (selectedQuantity > product?.quantity) {
      setModalMessage('Selected quantity exceeds available stock.');
      return;
    }
    if (!selectedAddress) {
      setModalMessage('Please select a delivery address.');
      return;
    }
    setShowPaymentOptions(true);
  };

  // Handle Confirm Purchase
  const handleConfirmPurchase = async () => {
    setIsUploading(true);
    document.body.style.overflow = 'hidden';

    if (selectedPaymentMethod) {
      const totalPrice = product.price * selectedQuantity + 30; // Adding delivery charge
      const orderId = `${product.id}`; // Unique Order ID

      try {
        // Save purchase data under the buyer's Firestore document
        await setDoc(doc(db, 'users', userId, 'purchasedProducts', product.id), {
          productId: product.id,
          productName: product.productName,
          price: product.price,
          quantity: selectedQuantity,
          totalPrice,
          paymentMethod: selectedPaymentMethod,
          address: selectedAddress, // Include selected address
          imageUrl: product.imageUrl, // Make sure the imageUrl is being saved
          date: new Date().toISOString(),
        });

        // Check if the product contains the seller's ID
        const sellerId = product.userId; // Ensure `userId` is fetched from product document
        if (sellerId) {
          // Generate unique QR code content (JSON format)
          const qrData = JSON.stringify({
            orderId,
            sellerId,
            buyerId: userId,
            buyerContact: selectedAddress.Contact, // ✅ Add buyer's contact number
            buyerName: selectedAddress.Usernname,
            Email: selectedAddress.Email,
            productName: product.productName,
            price: product.price,
          });

          // Save purchase data under the seller's Firestore document
          await setDoc(doc(db, 'users', sellerId, 'soldProducts', product.id), {
            productId: product.id,
            buyerId: userId,
            buyerName: selectedAddress.Resident,
            productName: product.productName,
            price: product.price,
            quantity: selectedQuantity,
            totalPrice,
            address: selectedAddress,
            paymentMethod: selectedPaymentMethod,
            imageUrl: product.imageUrl, // Make sure the imageUrl is being saved
            qrCode: qrData,  // ✅ Store QR Code **only** in the seller's account
            date: new Date().toISOString(),
          });

          // Update the product's stock in the global `local` collection
          const productRef = doc(db, `local/${productId}`);
          await updateDoc(productRef, {
            quantity: product.quantity - selectedQuantity,
          });

          // Update the product's stock in the seller's collection
          const sellerProductRef = doc(db, `users/${sellerId}/products/${productId}`);
          await updateDoc(sellerProductRef, {
            quantity: product.quantity - selectedQuantity,
          });

          // If the user is a seller, also deduct the quantity from their own product stock
          if (userId === sellerId) {
            const userProductRef = doc(db, `users/${userId}/products/${productId}`);
            await updateDoc(userProductRef, {
              quantity: product.quantity - selectedQuantity,
            });
          }
        } else {
          setModalMessage('Product does not contain a seller ID.');
        }

        // Set a success message and trigger page reload after purchase
        setModernMessage(`Purchase confirmed! Total Price: ₹${totalPrice}`);
        setShowPaymentOptions(false);
        setSelectedPaymentMethod('');

      } catch (error) {
        console.error('Error confirming purchase:', error);
        setModalMessage('There was an error confirming your purchase. Please try again later.');
      }
    } else {
      setModalMessage('Please select a payment method before proceeding.');
    }
};



  // Handle payment cancelation
  const handleCancel = () => {
    setShowPaymentOptions(false);
    setSelectedPaymentMethod('');
  };

  if (loading) {
    return <p className="msg">
      <img src='loading.gif' alt='loading' />
      <div>
        Loading products details ...
      </div></p>;
  }

  if (!product) {
    return <p className="msg">
      <img src='loading.gif' alt='loading' />
      <div>
        Loading products details ...
      </div></p>;
  }

  const totalPrice = (product?.price * selectedQuantity) + 30; // Adding delivery charge of 30

  return (
    <div className="product-details">
      <img src={product.imageUrl} alt={product.productName} />
      <div className="details">
        <div>
          <h3>{product.productName}</h3>
          <p><strong>Price:</strong> ₹{product.price}</p>
          <p><strong>Available Quantity:</strong> {product.quantity}</p>
          <p><strong>Description:</strong>{product.des}</p>
          <div>
            {product.quantity === 0 || product.quantity === null ? (
              <h2 className="out-of-stock">Out of Stock</h2>
            ) : (
              <div>
                <label htmlFor="quantity">Select Quantity:</label>
                <select
                  id="quantity"
                  className="quantity-selector"
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(parseInt(e.target.value))}
                >
                  {Array.from({ length: product.quantity }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
                <button onClick={handleBuyClick} className="buy-button">
                  Buy Product
                </button>
              </div>
            )}
          </div>
        </div>
        {showPaymentOptions && (
          <div className="payment-options">
            <div>
              <h2>Product Details</h2>
              <p className="total-price">
                <p className='strong'>Single Price<span>₹{product.price} </span></p>
                <p className='strong'>Product Price<span>₹{product.price * selectedQuantity}</span></p>
                <p className='strong'>Delivery Charge<span>₹30</span></p>
                <p className='strong'>Total Price<span>₹{totalPrice} </span></p>
              </p>
            </div>
            <div className="payment-methods">
              <h2>Choose Payment Method</h2>
              <label>
                PhonePe
                <input
                  type="radio"
                  name="payment-method"
                  value="PhonePe"
                  checked={selectedPaymentMethod === 'PhonePe'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                />
              </label>
              <label>
                GPay
                <input
                  type="radio"
                  name="payment-method"
                  value="GPay"
                  checked={selectedPaymentMethod === 'GPay'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                />
              </label>
              <label>
                UPI Pay
                <input
                  type="radio"
                  name="payment-method"
                  value="UPI Pay"
                  checked={selectedPaymentMethod === 'UPI Pay'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                />
              </label>
              <label>
                Cash on Delivery
                <input
                  type="radio"
                  name="payment-method"
                  value="Cash on Delivery"
                  checked={selectedPaymentMethod === 'Cash on Delivery'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                />
              </label>
            </div>
            <div className='load'>
  {isUploading && (
    <div className="loading-cp">
      <div className='load-data'>
        <img src="https://i.pinimg.com/originals/5a/d0/47/5ad047a18772cf0488a908d98942f9bf.gif" alt="Loading..." className="load-icon" />
        <div>
          <p className="cp">Confirming Purchase...</p>
        </div>
      </div>
    </div>
  )}
</div>

            <div className="payment-buttons">
              <div className="payment-buttons">
                <button className="confirm-button" disabled={isUploading} onClick={handleConfirmPurchase}>
                  Confirm Purchase
                </button>

                <button className="cancel-button" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className='addr-Cust'>
        <div className="address-list">
          <h2>Delivery Address</h2>
          {addresses.length > 0 ? (
            <ul>
              {addresses.map((addr) => (
                <li key={addr.id}>
                  <label>
                    <p>Name: {addr.Usernname}</p>
                    <p>{addr.Resident}</p>
                    <p>{addr.street}, {addr.location}</p>
                    <p>{addr.city} - {addr.zipCode}</p>
                    <p>{addr.state}, {addr.country}</p>
                    <p>Contact: {addr.Contact}</p>
                    <p className='select'><input
                      type="radio"
                      name="address"
                      value={addr.id}
                      onChange={() => setSelectedAddress(addr)}
                    />Select</p>
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p>No addresses saved yet.</p>
          )}
        </div>
      </div>
      {modalMessage && <Modal message={modalMessage} onClose={() => setModalMessage('')} />}
      {modernMessage && <Modern message={modernMessage} onClose={() => setModernMessage('')} />}
    </div>
  );
};

export default ProductDetails;

import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Firebase auth
import { db } from "./firebase"; // Firebase config
import { collection, doc, setDoc, getDocs, deleteDoc } from "firebase/firestore";
import Error from "./Error"; // Custom Error component
import "../CSS/Address.css"; // Custom CSS

const AddressForm = () => {
  const [address, setAddress] = useState({
    Resident: "",
    street: "",
    location: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    Contact: "",
    Usernname: "",
    Image: null,
  });
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(""); // To store user email
  const [errorMessage, setErrorMessage] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setUserEmail(user.email); // Set user email
        fetchAddresses(user.uid);
      } else {
        setUserId(null);
        setAddresses([]);
        setUserEmail("");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress({
      ...address,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    setAddress({
      ...address,
      Image: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setErrorMessage("You must be logged in to save an address.");
      return;
    }

    try {
      setLoading(true);

      // If an image is selected, convert it to a base64 string
      let imageUrl = "";
      if (address.Image) {
        const reader = new FileReader();
        reader.readAsDataURL(address.Image);

        reader.onload = async () => {
          imageUrl = reader.result;

          const addressRef = editingId
            ? doc(db, `users/${userId}/addresses`, editingId)
            : doc(collection(db, `users/${userId}/addresses`));

          const addressData = {
            ...address,
            Image: imageUrl, // Store the image URL
          };

          await setDoc(addressRef, addressData, { merge: true });
          alert(editingId ? "Address updated successfully." : "Address saved successfully.");
          
          // Reset form after submission
          setAddress({
            Resident: "",
            street: "",
            location: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
            Contact: "",
            Usernname: "",
            Image: null,
          });
          setEditingId(null);
          fetchAddresses(userId);
          setErrorMessage("");
        };

        reader.onerror = () => {
          setErrorMessage("Error reading the file.");
          setLoading(false);
        };
      } else {
        setErrorMessage("Please upload an image.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error saving address:", error);
      setErrorMessage("Error saving address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async (uid) => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, `users/${uid}/addresses`));
      const fetchedAddresses = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAddresses(fetchedAddresses);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setErrorMessage("Error fetching addresses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    const addressToEdit = addresses.find((addr) => addr.id === id);
    if (addressToEdit) {
      setAddress(addressToEdit);
      setEditingId(id);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, `users/${userId}/addresses`, id));
        fetchAddresses(userId);
        alert("Address deleted successfully.");
      } catch (error) {
        console.error("Error deleting address:", error);
        setErrorMessage("Error deleting address. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="contain">
            <div className="add-container">
        <div className="address-list">
          <h2>Saved Addresses</h2>
          {loading && <p>Loading...</p>}
          {addresses.length > 0 ? (
            <ul>
              {addresses.map((addr) => (
                <li key={addr.id}>
                  <p>{addr.Resident}</p>
                  <p>{addr.street}, {addr.location}</p>
                  <p>{addr.city} - {addr.zipCode}</p>
                  <p>{addr.state}, {addr.country}</p>
                  <p>Name: {addr.Usernname}</p>
                  <p>Contact: {addr.Contact}</p>
                  <button className="edit" onClick={() => handleEdit(addr.id)}>Edit</button>
                  <button className="Delete" onClick={() => handleDelete(addr.id)}>Delete</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No addresses saved.</p>
          )}
        </div>
      </div>
          <div className="Profile"> 
      {addresses.map((addr) => (
        <ul>
                <li key={addr.id}>
                  {addr.Image && (
                    <div className="image-container">
                      <img 
                        src={addr.Image} 
                        alt="Address" 
                        className="address-image" 
                        style={{ width: "100px", height: "100px", objectFit: "cover" }} 
                      />
                    <div className="profile-data">
                      <h1>{addr.Usernname}</h1>
                   <li>
                   <strong>Email: </strong> {userEmail}
                   </li>  
                   <li>
                   <strong>Contact: </strong> {addr.Contact}
                   </li>
                    </div>
                    </div>
                  )}
                </li>
                </ul>
              ))}
      </div>
      <div className="address-form">
        <h2>{editingId ? "Edit Address" : "Save Address"}</h2>
        {errorMessage && <Error message={errorMessage} />}
        {loading && <p>Loading...</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label> Resident/Chawl Name: 
              <input type="text" name="Resident" value={address.Resident} onChange={handleChange} required />
            </label>
            <label> Street:
              <input type="text" name="street" value={address.street} onChange={handleChange} required />
            </label>
          </div>
          <div className="form-group">
            <label> Famous Location/Medical/Store:
              <input type="text" name="location" value={address.location} onChange={handleChange} required />
            </label>
            <label> City:
              <input type="text" name="city" value={address.city} onChange={handleChange} required />
            </label>
          </div>
          <div className="form-group">
            <label> State:
              <input type="text" name="state" value={address.state} onChange={handleChange} required />
            </label>
            <label> Zip Code:
            <input type="text" name="zipCode" value={address.zipCode} onChange={handleChange} required />
            </label>
          </div>
          <div className="form-group">
            <label> Country:
              <input type="text" name="country" value={address.country} onChange={handleChange} required />
            </label>
            <label> Contact:
            <input type="text" name="Contact" value={address.Contact} onChange={handleChange} required />
            </label>
          </div>
          <div className="form-group">
            <label> Usernname:
            <input type="text" name="Usernname" value={address.Usernname} onChange={handleChange} required />
            </label>
            <label> Upload Image:
            <input type="file" name="Image" onChange={handleImageChange} required />
            </label>
          </div>
          <button type="submit">{editingId ? "Update Address" : "Save Address"}</button>
        </form>
      </div>
    </div>
  );
};

export default AddressForm;

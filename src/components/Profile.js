import React, { useState, useEffect } from 'react';
import { storage, db } from './firebase';  
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const Profile = ({ userId }) => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [isNewPhoto, setIsNewPhoto] = useState(false); 

  // Fetch profile image URL from Firestore
  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setProfileImage(userDoc.data().profileImage || null);
        }
      } catch (error) {
        console.log('Error fetching profile image:', error);
      }
    };

    fetchProfileImage();
  }, [userId]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setIsNewPhoto(true);  // Mark that a new photo is selected
    }
  };

  const handleUpload = () => {
    if (!file) {
      alert('Please select an image file.');
      return;
    }
  
    const storageRef = ref(storage, `/users/${userId}/Profile/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
  
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(prog);
      },
      (error) => {
        setUploadError(error.message);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          // Save the profile image URL to Firestore under users/userId/profile
          setDoc(doc(db, 'users', userId), {
            profile: { image: downloadURL }  // Save the image URL in the profile field
          }, { merge: true }).then(() => {
            setProfileImage(downloadURL);
            setIsNewPhoto(false);  // Reset new photo state after upload
            alert('Profile image uploaded successfully!');
          }).catch((error) => {
            setUploadError('Error saving URL to Firestore: ' + error.message);
          });
        });
      }
    );
  };
  

  const handleChangePhoto = () => {
    setFile(null);
    setIsNewPhoto(false); // Reset the new photo state
    setProfileImage(null); // Optionally, reset the current profile image as well
    alert('Please upload a new photo.');
  };

  return (
    <div className="profile-container">
      <h2>{profileImage ? 'Change Profile Image' : 'Upload Profile Image'}</h2>
      
      {profileImage ? (
        <div>
          <img src={profileImage} alt="Profile" className="profile-img" />
          <p>Click below to change your profile photo.</p>
        </div>
      ) : (
        <p>No profile image yet. Please upload a photo.</p>
      )}

      {/* File input with custom label */}
      <label htmlFor="file-upload" className="file-upload-label">
        {isNewPhoto ? 'Change Photo' : 'Choose Photo'}
      </label>
      <input 
        id="file-upload"
        type="file" 
        onChange={handleFileChange} 
        className="file-upload-input"
        style={{ display: 'none' }} // Hide default input field
      />

      {/* Show either "Upload Photo" or "Change Photo" button */}
      {isNewPhoto ? (
        <div>
          <button onClick={handleUpload} className="upload-button">Upload Photo</button>
        </div>
      ) : profileImage ? (
        <button onClick={handleChangePhoto} className="change-button">Change</button>
      ) : null}

      {progress > 0 && <p>Uploading: {Math.round(progress)}%</p>}
      {uploadError && <p className="error-text">{uploadError}</p>}
    </div>
  );
};

export default Profile;

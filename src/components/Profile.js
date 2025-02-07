import React, { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import Error from "./Error";

const Profile = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // State for delete button loading
  const fileInputRef = useRef(null);

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

  const handleImageChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setUploadError("No user is currently logged in.");
        startTimer();
        setIsUploading(false);
        return;
      }

      const userId = currentUser.uid;

      if (profileImage) {
        const reader = new FileReader();
        reader.readAsDataURL(profileImage);

        reader.onload = async () => {
          const imageUrl = reader.result;

          await setDoc(
            doc(db, `users/${userId}/profilePic/image`),
            {
              profilePic: imageUrl,
              uploadedAt: new Date(),
            },
            { merge: true }
          );

          setUploadedImageUrl(imageUrl);
          setProfileImage(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          setUploadSuccess("Profile picture updated successfully.");
          setUploadError("");
          startTimer();
          setIsUploading(false);
        };

        reader.onerror = () => {
          setUploadError("Error reading the file.");
          setIsUploading(false);
          startTimer();
        };
      } else {
        setUploadError("Please upload an image.");
        setIsUploading(false);
        startTimer();
      }
    } catch (error) {
      setUploadError("Error uploading image: " + error.message);
      setIsUploading(false);
      startTimer();
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);  // Set to true when deletion starts

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) return;

      const userId = currentUser.uid;
      await deleteDoc(doc(db, `users/${userId}/profilePic/image`));

      setUploadedImageUrl(null);
      setUploadSuccess("Profile picture deleted successfully.");
      startTimer();
    } catch (error) {
      setUploadError("Error deleting image: " + error.message);
      startTimer();
    } finally {
      setIsDeleting(false);  // Set to false after deletion is complete (success or error)
    }
  };

  const handleChangeClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const startTimer = () => {
    setTimeout(() => {
      setUploadSuccess("");
      setUploadError("");
    }, 3000);
  };

  return (
    <div className="profile-container">
      {uploadSuccess && <p className="success-message">{uploadSuccess}</p>}
      {uploadError && <Error message={uploadError} />}
      <div className="profile-form-wrapper">
        <img
          src={uploadedImageUrl || "user.png"}
          alt="Profile"
          className="profile-image"
        />

        <form onSubmit={handleSubmit}>
          <div className="profile-input-group">
            {!profileImage ? (
              <>
                {uploadedImageUrl ? (
                  <>
                    <button
                      type="button"
                      className="change"
                      onClick={handleChangeClick}
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      className="Delete-btn"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <span>
                          <img
                            src="loading.gif"
                            alt="Loading..."
                            style={{
                              width: "20px",
                              marginRight: "10px",
                              verticalAlign: "middle",
                            }}
                          />
                          Deleting...
                        </span>
                      ) : (
                        "Delete"
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="select-btn"
                    onClick={handleChangeClick}
                  >
                    Select Image
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />
              </>
            ) : (
              <button
                type="submit"
                className="profile-submit-btn"
                disabled={isUploading}
              >
                {isUploading ? (
                  <span>
                    <img
                      src="loading.gif"
                      alt="Loading..."
                      style={{
                        width: "20px",
                        marginRight: "10px",
                        verticalAlign: "middle",
                      }}
                    />
                    Uploading...
                  </span>
                ) : (
                  "Upload"
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;

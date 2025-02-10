import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import emailjs from "@emailjs/browser";
import { db } from "./firebase"; // ✅ Import Firestore
import { doc, updateDoc, getDoc } from "firebase/firestore";
import "../CSS/Scanner.css";

const Scanner = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const scannerInstance = useRef(null);
  const scannerContainer = useRef(null);

  const initializeScanner = () => {
    if (scannerInstance.current) {
      scannerInstance.current.clear();
    }

    scannerInstance.current = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    scannerInstance.current.render(
      (decodedText) => {
        try {
          const parsedData = JSON.parse(decodedText);

          // ✅ Validate required fields
          if (
            !parsedData.Email ||
            !parsedData.sellerId ||
            !parsedData.buyerId ||
            !parsedData.orderId ||
            !parsedData.productName
          ) {
            throw new Error("Invalid product details in QR code.");
          }

          setScannedData(parsedData);
          setEmail(parsedData.Email);
          setMessage("✅ QR Code scanned successfully! Verify OTP.");
          setError("");
          scannerInstance.current.clear(); // Stop scanner after success
        } catch (err) {
          setError(`⚠️ QR Code Error: ${err.message}`);
        }
      },
      (errorMessage) => {
        setError(`⚠️ Scanner Error: ${errorMessage}`);
      }
    );
  };

  useEffect(() => {
    initializeScanner();
    return () => {
      if (scannerInstance.current) {
        scannerInstance.current.clear();
      }
    };
  }, []);

  const sendOtp = () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("⚠️ Please enter a valid email.");
      return;
    }

    setOtpSent(true);
    setMessage("📩 Sending OTP...");
    const otpCode = Math.floor(100000 + Math.random() * 900000);
    setGeneratedOtp(otpCode);

    const emailParams = {
      to_email: email,
      otp: otpCode,
    };

    emailjs
      .send("service_bjfvyin", "template_sxmabpf", emailParams, "gkrWAPa8psVVZhdbT")
      .then((response) => {
        console.log("✅ Email sent successfully:", response);
        setMessage(`✅ OTP sent to ${email}`);
        setError("");
      })
      .catch((err) => {
        console.error("⚠️ EmailJS Error:", err);
        setError(`⚠️ Error sending OTP: ${err.text || err.message || "Unknown Error"}`);
        setOtpSent(false);
      });
  };

  const updateProductStatus = async (sellerId, buyerId, orderId) => {
    try {
      if (!sellerId || !buyerId || !orderId) {
        throw new Error("❌ Invalid input! Missing sellerId, buyerId, or orderId.");
      }

      // Extract the actual order ID (remove timestamp if exists)
      const actualOrderId = orderId.split("_")[0];

      const sellerRef = doc(db, `users/${sellerId}/soldProducts/${actualOrderId}`);
      const buyerRef = doc(db, `users/${buyerId}/purchasedProducts/${actualOrderId}`);

      const sellerSnap = await getDoc(sellerRef);
      const buyerSnap = await getDoc(buyerRef);

      if (!sellerSnap.exists()) {
        throw new Error(`❌ Order not found in seller's records: ${sellerRef.path}`);
      }
      if (!buyerSnap.exists()) {
        throw new Error(`❌ Order not found in buyer's records: ${buyerRef.path}`);
      }

      // Update delivery status
      await updateDoc(sellerRef, { status: "Product Delivered" });
      await updateDoc(buyerRef, { status: "Product Delivered" });
      await updateDoc(sellerRef, { delivery: "https://cdn-icons-png.flaticon.com/512/17421/17421046.png" });
      await updateDoc(buyerRef, { delivery: "https://cdn-icons-png.flaticon.com/512/17421/17421046.png" });

      console.log("✅ Product marked as delivered!");
      return { success: true };
    } catch (error) {
      console.error("⚠️ Firestore Update Error:", error.message);
      return { success: false, error: error.message };
    }
  };

  const verifyOtp = () => {
    if (!otp.trim() || otp.length !== 6) {
      setError("⚠️ Enter a valid 6-digit OTP.");
      return;
    }
    if (parseInt(otp) === generatedOtp) {
      setMessage("✅ OTP Verified! Email authenticated.");
      setGeneratedOtp(null);
      setError("");

      if (scannedData) {
        updateProductStatus(scannedData.sellerId, scannedData.buyerId, scannedData.orderId)
          .then((result) => {
            if (result.success) {
              setMessage("✅ Product marked as delivered!");
            } else {
              setError(`❌ Firestore update failed: ${result.error}`);
            }
          });
      } else {
        setError("⚠️ No scanned data found!");
      }

      setTimeout(() => {
        setEmail("");
        setOtp("");
        setOtpSent(false);
      }, 4000);
    } else {
      setError("❌ Incorrect OTP. Try again.");
      initializeScanner(); // Restart scanner if OTP is incorrect
    }
  };

  const resetScanner = () => {
    setEmail("");
    setOtp("");
    setOtpSent(false);
    setScannedData(null);
    setMessage("");
    setError("");
    initializeScanner(); // Restart the scanner
  };

  return (
    <div className="scanner">
      <h2>QR Code Scanner & OTP Verification</h2>
      <div id="reader" ref={scannerContainer}></div>

      <div className="insert-email">
        <div className="send-otp">
          <h3>Enter Email:</h3>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter or scan email"
          />
          <button onClick={sendOtp} disabled={otpSent}>
            {otpSent ? "✅ OTP Sent" : "📩 Send OTP"}
          </button>
        </div>

        {otpSent && (
          <div className="verify">
            <h3>Enter OTP</h3>
            <input
              type="text"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ""); // Remove non-numeric chars
                if (value.length <= 6) setOtp(value);
              }}
              placeholder="Enter OTP"
              maxLength="6"
            />
            <button onClick={verifyOtp}>✔ Verify OTP</button>
          </div>
        )}

        {scannedData && (
          <div className="qr-details">
            <h3>📦 Scanned Product Details</h3>
            <p><strong>Email:</strong> {scannedData.Email}</p>
            <p><strong>Seller ID:</strong> {scannedData.sellerId}</p>
            <p><strong>Buyer ID:</strong> {scannedData.buyerId}</p>
            <p><strong>Order ID:</strong> {scannedData.orderId}</p>
            <p><strong>Product Name:</strong> {scannedData.productName}</p>
          </div>
        )}

        <button onClick={resetScanner}>🔄 Scan Again</button>

        <div className="email-error">
          {message && <p style={{ color: "green" }}>{message}</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default Scanner;

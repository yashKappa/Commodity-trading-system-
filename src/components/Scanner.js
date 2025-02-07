import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import emailjs from "@emailjs/browser";

const Scanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [message, setMessage] = useState("");
  const scannerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const startScanner = () => {
    setIsScanning(true);
    scannerRef.current = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    scannerRef.current.render(
      (decodedText) => {
        try {
          const parsedData = JSON.parse(decodedText);
          const buyerEmail = parsedData.buyerEmail || "";

          if (!buyerEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setMessage("Invalid email found in QR code.");
            return;
          }

          setEmail(buyerEmail);
          setIsScanning(false);
          scannerRef.current.clear(); // Stop scanning
          sendOtp(buyerEmail);
        } catch (error) {
          console.error("Invalid QR Code Data:", error);
          setMessage("Failed to read QR code.");
        }
      },
      (errorMessage) => console.log("Scan Error:", errorMessage)
    );
  };

  const sendOtp = (buyerEmail) => {
    setMessage("Sending OTP...");
    const otpCode = Math.floor(100000 + Math.random() * 900000);
    setGeneratedOtp(otpCode);

    const emailParams = {
      to_email: buyerEmail,
      otp_code: otpCode,
    };

    emailjs
      .send("service_bjfvyin", "template_3tpys9h", emailParams, "gkrWAPa8psVVZhdbT")
      .then(() => {
        setMessage(`OTP sent to ${buyerEmail}`);
      })
      .catch((error) => {
        console.error("EmailJS Error:", error);
        setMessage("Error sending OTP.");
      });
  };

  const verifyOtp = () => {
    if (!otp.trim() || otp.length !== 6) {
      setMessage("Enter a valid 6-digit OTP.");
      return;
    }

    if (parseInt(otp) === generatedOtp) {
      setMessage("✅ OTP Verified! Buyer authenticated.");
      setGeneratedOtp(null);
    } else {
      setMessage("❌ Incorrect OTP. Try again.");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>QR Code Scanner & OTP Verification</h2>
      {!isScanning && <button onClick={startScanner}>Start Scan</button>}
      {isScanning && <div id="reader"></div>}
      {email && <h3>OTP sent to: {email}</h3>}

      {generatedOtp !== null && (
        <div>
          <h3>Enter OTP</h3>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
          />
          <button onClick={verifyOtp}>Verify OTP</button>
        </div>
      )}

      {message && <p>{message}</p>}
    </div>
  );
};

export default Scanner;

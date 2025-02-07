import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import emailjs from "@emailjs/browser";

const Scanner = () => {
  const [scannedData, setScannedData] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [message, setMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    scannerRef.current.render(
      (decodedText) => {
        try {
          const parsedData = JSON.parse(decodedText);
          setScannedData(parsedData);
          setPhoneNumber(parsedData.buyerContact || "");
        } catch (error) {
          console.error("Invalid QR Code Data:", error);
        }
      },
      (errorMessage) => console.log("Scan Error:", errorMessage)
    );

    return () => {
      scannerRef.current?.clear();
    };
  }, []);

  const sendOtp = () => {
    if (!phoneNumber.match(/^\d{10}$/)) {
      setMessage("Invalid phone number detected.");
      return;
    }
  
    setOtpSent(true);
    setMessage("Sending OTP...");
  
    const otpCode = Math.floor(100000 + Math.random() * 900000);
    setGeneratedOtp(otpCode);
  
    const emailParams = {
      to_email: `buyer_${phoneNumber}@example.com`, // Fixed template literal syntax
      otp_code: otpCode,
    };
  
    emailjs
      .send("service_bjfvyin", "template_3tpys9h", emailParams, "gkrWAPa8psVVZhdbT")
      .then(() => {
        setMessage(`OTP sent to ${phoneNumber}`); // Fixed template literal syntax
      })
      .catch((error) => {
        console.error("EmailJS Error:", error);
        setMessage("Error sending OTP.");
        setOtpSent(false);
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
      <div id="reader"></div>

      {scannedData && (
        <div>
          <h3>Scanned QR Data:</h3>
          <pre>{JSON.stringify(scannedData, null, 2)}</pre>
        </div>
      )}

      {phoneNumber && (
        <div>
          <h3>Buyer Contact: {phoneNumber}</h3>
          <button onClick={sendOtp} disabled={otpSent}>
            {otpSent ? "OTP Sent" : "Send OTP"}
          </button>
        </div>
      )}

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
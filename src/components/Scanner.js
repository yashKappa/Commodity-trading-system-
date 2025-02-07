import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import emailjs from "@emailjs/browser";

const Scanner = () => {
  const [email, setEmail] = useState("");
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
          
          if (!parsedData.Email || !/\S+@\S+\.\S+/.test(parsedData.Email)) {
            setMessage("Invalid email in QR code.");
            return;
          }

          setEmail(parsedData.Email);
          setMessage("Email detected! Click 'Send OTP' to verify.");
        } catch (error) {
          console.error("Invalid QR Code Data:", error);
          setMessage("Failed to read QR code.");
        }
      },
      (errorMessage) => console.log("Scan Error:", errorMessage)
    );

    return () => {
      scannerRef.current?.clear();
    };
  }, []);

  const sendOtp = () => {
    if (!email) {
      setMessage("No valid email found.");
      return;
    }

    setOtpSent(true);
    setMessage("Sending OTP...");

    const otpCode = Math.floor(100000 + Math.random() * 900000);
    setGeneratedOtp(otpCode);

    const emailParams = {
      to_email: email,
      otp_code: otpCode,
    };

    emailjs
      .send("service_bjfvyin", "template_3tpys9h", emailParams, "gkrWAPa8psVVZhdbT")
      .then(() => {
        setMessage(`OTP sent to ${email}`);
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
      setMessage("✅ OTP Verified! Email authenticated.");
      setGeneratedOtp(null);
    } else {
      setMessage("❌ Incorrect OTP. Try again.");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>QR Code Scanner & OTP Verification</h2>
      <div id="reader"></div>

      {email && (
        <div>
          <h3>Email: {email}</h3>
          <button onClick={sendOtp} disabled={otpSent}>
            {otpSent ? "OTP Sent" : "Send OTP"}
          </button>
        </div>
      )}

      {otpSent && (
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

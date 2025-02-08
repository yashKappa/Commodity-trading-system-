import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import emailjs from "@emailjs/browser";

const Scanner = () => {
  const [email, setEmail] = useState(""); // Input field email
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
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
          let extractedEmail;
          if (decodedText.startsWith("{") && decodedText.endsWith("}")) {
            const parsedData = JSON.parse(decodedText);
            if (!parsedData.Email || !/\S+@\S+\.\S+/.test(parsedData.Email)) {
              throw new Error("Invalid email in QR code.");
            }
            extractedEmail = parsedData.Email;
          } else {
            if (!/\S+@\S+\.\S+/.test(decodedText)) {
              throw new Error("Invalid email format in QR code.");
            }
            extractedEmail = decodedText;
          }

          setEmail(extractedEmail); // Populate input field
          setMessage("✅ Email detected! You can edit it if needed.");
          setError("");
        } catch (err) {
          setError(`⚠️ QR Code Error: ${err.message}`);
        }
      },
      (errorMessage) => {
        setError(`⚠️ Scanner Error: ${errorMessage}`);
      }
    );

    return () => {
      scannerRef.current?.clear();
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
      to_email: email, // Send OTP to input email
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

  const verifyOtp = () => {
    if (!otp.trim() || otp.length !== 6) {
      setError("⚠️ Enter a valid 6-digit OTP.");
      return;
    }
    if (parseInt(otp) === generatedOtp) {
      setMessage("✅ OTP Verified! Email authenticated.");
      setGeneratedOtp(null);
      setError("");
    } else {
      setError("❌ Incorrect OTP. Try again.");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>QR Code Scanner & OTP Verification</h2>
      <div id="reader"></div>

      <div>
        <h3>Enter Email:</h3>
        <input
          type="email"
          value={email} // Email appears inside input field
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter or scan email"
        />
        <button onClick={sendOtp} disabled={otpSent}>
          {otpSent ? "✅ OTP Sent" : "📩 Send OTP"}
        </button>
      </div>

      {otpSent && (
        <div>
          <h3>Enter OTP</h3>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
          />
          <button onClick={verifyOtp}>✔ Verify OTP</button>
        </div>
      )}

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Scanner;

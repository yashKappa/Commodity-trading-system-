import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import emailjs from "@emailjs/browser";
import "../CSS/Scanner.css";

const Scanner = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
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

          setEmail(extractedEmail);
          setMessage("✅ Email detected! You can edit it if needed.");
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

  const stopScanner = () => {
    if (scannerInstance.current) {
      scannerInstance.current.clear();
    }
  };

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

  const verifyOtp = () => {
    if (!otp.trim() || otp.length !== 6) {
      setError("⚠️ Enter a valid 6-digit OTP.");
      return;
    }
    if (parseInt(otp) === generatedOtp) {
      setMessage("✅ OTP Verified! Email authenticated.");
      setGeneratedOtp(null);
      setError("");

      setTimeout(() => {
        setEmail("");
        setOtp("");
        setOtpSent(false);
        stopScanner(); // Stop scanner after 4 seconds
      }, 4000);
    } else {
      setError("❌ Incorrect OTP. Try again.");
    }
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
              type="number"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              maxLength="6"
            />
            <button onClick={verifyOtp}>✔ Verify OTP</button>
          </div>
        )}

        <div className="email-error">
          {message && <p style={{ color: "green" }}>{message}</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default Scanner;

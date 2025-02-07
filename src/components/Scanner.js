import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import emailjs from "@emailjs/browser";

const Scanner = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(""); // ✅ New state to store errors
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

          // If QR code contains JSON, parse it
          if (decodedText.startsWith("{") && decodedText.endsWith("}")) {
            const parsedData = JSON.parse(decodedText);
            if (!parsedData.Email || !/\S+@\S+\.\S+/.test(parsedData.Email)) {
              throw new Error("Invalid email in QR code.");
            }
            extractedEmail = parsedData.Email;
          } else {
            // If QR code is plain text, check if it's a valid email
            if (!/\S+@\S+\.\S+/.test(decodedText)) {
              throw new Error("Invalid email format in QR code.");
            }
            extractedEmail = decodedText;
          }

          setEmail(extractedEmail);
          setMessage("✅ Email detected! Click 'Send OTP' to verify.");
          setError(""); // Clear previous errors
        } catch (err) {
          console.error("QR Code Error:", err);
          setError(`⚠️ QR Code Error: ${err.message}\n\nStack Trace:\n${err.stack}`);
        }
      },
      (errorMessage) => {
        console.log("Scan Error:", errorMessage);
        setError(`⚠️ Scanner Error: ${errorMessage}`);
      }
    );

    return () => {
      scannerRef.current?.clear();
    };
  }, []);

  const sendOtp = () => {
    if (!email) {
      setError("⚠️ Error: No valid email found.");
      return;
    }

    setOtpSent(true);
    setMessage("📩 Sending OTP...");

    const otpCode = Math.floor(100000 + Math.random() * 900000);
    setGeneratedOtp(otpCode);

    const emailParams = {
      to_email: email,
      otp_code: otpCode.toString(),
    };

    emailjs
      .send(
        "service_bjfvyin", // ✅ Your EmailJS Service ID
        "__ejs-test-mail-service__", // ✅ Your EmailJS Template ID
        emailParams,
        "gkrWAPa8psVVZhdbT" // ✅ Your EmailJS Public Key
      )
      .then((response) => {
        console.log("Email sent successfully:", response);
        setMessage(`✅ OTP sent to ${email}`);
        setError(""); // Clear previous errors
      })
      .catch((err) => {
        console.error("EmailJS Error:", err);
        setError(`⚠️ Error sending OTP: ${err.message}\n\nStack Trace:\n${err.stack}`);
        setOtpSent(false);
      });
  };

  const verifyOtp = () => {
    if (!otp.trim() || otp.length !== 6) {
      setError("⚠️ Error: Enter a valid 6-digit OTP.");
      return;
    }

    if (parseInt(otp) === generatedOtp) {
      setMessage("✅ OTP Verified! Email authenticated.");
      setGeneratedOtp(null);
      setError(""); // Clear errors after success
    } else {
      setError("❌ Incorrect OTP. Try again.");
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
            {otpSent ? "✅ OTP Sent" : "📩 Send OTP"}
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
          <button onClick={verifyOtp}>✔ Verify OTP</button>
        </div>
      )}

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && (
        <pre
          style={{
            color: "red",
            fontWeight: "bold",
            backgroundColor: "#ffe6e6",
            padding: "10px",
            whiteSpace: "pre-wrap", // ✅ Keeps formatting for stack trace
            textAlign: "left",
            borderRadius: "5px",
          }}
        >
          {error}
        </pre>
      )}
    </div>
  );
};

export default Scanner;

import React from 'react';
import '../CSS/error.css';

const Error = ({ message }) => {
  return <p className="error-message">{message}</p>;
};

export default Error;

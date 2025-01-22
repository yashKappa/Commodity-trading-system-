import React from 'react';
import './error.css';

const Error = ({ message }) => {
  return <p className="error-message">{message}</p>;
};

export default Error;

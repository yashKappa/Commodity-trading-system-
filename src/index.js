import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Import BrowserRouter
import App from './App';
import Home from './components/Home';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
   <BrowserRouter basename='Commodity-trading-system-'>
  <Routes>
    <Route path="/" element={<App />} />
    <Route path="home" element={<Home />} />
    {/* Other routes */}
  </Routes>
</BrowserRouter>
  </React.StrictMode>
);

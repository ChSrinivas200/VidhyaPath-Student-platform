import React, { useState } from 'react';
import PDFTimer from './PDFTimer'; // Import the timer we made earlier
// If you don't have an icon library, usethis simple SVG below
// or import { FaClock } from 'react-icons/fa'; 

const FloatingTimer = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={styles.wrapper}>
      {/* 1. The Trigger Icon */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        style={styles.iconButton}
        title="Study Timer"
      >
        {/* Simple Clock SVG Icon */}
        <svg 
          width="24" height="24" viewBox="0 0 24 24" 
          fill="none" stroke="currentColor" strokeWidth="2" 
          strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      </button>

      {/* 2. The Popup (Only shows when isOpen is true) */}
      {isOpen && (
        <div style={styles.popup}>
          <PDFTimer />
        </div>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    position: 'absolute', // "Floats" on top of the PDF
    top: '20px',          // Adjust these to place it where you want
    right: '20px',        // Currently Top-Right corner
    zIndex: 1000,         // Ensures it sits ABOVE the PDF viewer
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end', // Aligns popup to the right edge
  },
  iconButton: {
    backgroundColor: '#2b2b2b',
    color: '#fff',
    border: 'none',
    borderRadius: '50%', // Circle shape
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
    marginBottom: '10px', // Space between icon and popup
    transition: 'transform 0.2s',
  },
  popup: {
    // The PDFTimer component will sit inside here
    animation: 'fadeIn 0.2s ease-in-out',
  }
};

export default FloatingTimer;
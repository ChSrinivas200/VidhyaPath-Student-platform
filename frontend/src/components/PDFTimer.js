import React, { useState, useEffect } from 'react';

const PDFTimer = () => {
  // State for the timer
  const [minutes, setMinutes] = useState(25); // Default 25 mins
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer Finished!
            clearInterval(interval);
            setIsActive(false);
            alert("Session Complete! Great work.");
            // TODO: Call your backend  API here to save the session
            // saveToBackend(25); 
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, minutes]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
  };

  return (
    <div style={styles.container}>
      {/* Header / Settings Icon Placeholder */}
      <div style={styles.header}>
        <span style={{fontSize: '12px', color: '#ccc'}}>Settings</span>
      </div>

      {/* Time Display */}
      <div style={styles.timeBox}>
        <div style={styles.timeBlock}>
          <span style={styles.number}>00</span>
          <span style={styles.label}>hr</span>
        </div>
        <span style={styles.colon}>:</span>
        <div style={styles.timeBlock}>
          <span style={styles.number}>
            {minutes < 10 ? `0${minutes}` : minutes}
          </span>
          <span style={styles.label}>min</span>
        </div>
         <span style={styles.colon}>:</span>
         <div style={styles.timeBlock}>
          <span style={styles.number}>
            {seconds < 10 ? `0${seconds}` : seconds}
          </span>
          <span style={styles.label}>sec</span>
        </div>
      </div>

      {/* Start Button */}
      <button onClick={toggleTimer} style={styles.button}>
        {isActive ? 'Pause Timer' : 'Start Timer'}
      </button>
      
      {/* Optional Reset */}
      {!isActive && minutes !== 25 && (
          <button onClick={resetTimer} style={styles.resetBtn}>Reset</button>
      )}
    </div>
  );
};

// Simple CSS Styles (You can move this to a CSS file)
const styles = {
  container: {
    backgroundColor: '#2b2b2b', // Dark background like screenshot
    color: 'white',
    padding: '20px',
    borderRadius: '12px',
    width: '250px',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
  },
  header: {
    textAlign: 'left',
    marginBottom: '10px'
  },
  timeBox: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid #444',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
    backgroundColor: '#333'
  },
  timeBlock: {
    display: 'flex',
    flexDirection: 'column',
    margin: '0 5px'
  },
  number: {
    fontSize: '24px',
    fontWeight: 'bold'
  },
  label: {
    fontSize: '10px',
    color: '#888'
  },
  colon: {
    fontSize: '20px',
    marginTop: '-15px',
    margin: '0 5px'
  },
  button: {
    backgroundColor: 'white',
    color: 'black',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%'
  },
  resetBtn: {
      marginTop: '10px',
      background: 'transparent',
      color: '#aaa',
      border: 'none',
      cursor: 'pointer',
      fontSize: '12px'
  }
};

export default PDFTimer;
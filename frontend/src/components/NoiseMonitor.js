import React, { useState, useEffect } from 'react';

const NoiseMonitor = () => {
  const [isNoisy, setIsNoisy] = useState(false);

  useEffect(() => {
    let audioContext;
    let analyser;
    let microphone;
    let javascriptNode;

    const startListening = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 1024;

        microphone.connect(analyser);
        analyser.connect(javascriptNode);
        javascriptNode.connect(audioContext.destination);

        javascriptNode.onaudioprocess = () => {
          const array = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(array);
          let values = 0;
          const length = array.length;

          // Calculate average volume
          for (let i = 0; i < length; i++) {
            values += array[i];
          }
          const average = values / length;

          // THRESHOLD: Adjust '30' to  be more or less sensitive
          if (average > 30) {
            setIsNoisy(true);
          } else {
            setIsNoisy(false);
          }
        };
      } catch (err) {
        console.error("Microphone access denied", err);
      }
    };

    startListening();

    // Cleanup when component unmounts
    return () => {
      if (audioContext) audioContext.close();
    };
  }, []);

  return (
    <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '8px', background: isNoisy ? '#ffebee' : '#e8f5e9' }}>
      <h3>🔊 Noise Monitor</h3>
      {isNoisy ? (
        <p style={{ color: 'red', fontWeight: 'bold' }}>⚠️ Too Loud! Focus might break.</p>
      ) : (
        <p style={{ color: 'green' }}>✅ Quiet Environment</p>
      )}
    </div>
  );
};

export default NoiseMonitor;
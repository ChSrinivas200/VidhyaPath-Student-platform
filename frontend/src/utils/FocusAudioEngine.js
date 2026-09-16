// Web Audio API Synthesizer for Focus Mode
// Synthesizes pristine soundscapes and brainwave frequencies natively with zero network buffering.

class FocusAudioEngine {
  constructor() {
    this.ctx = null;
    this.currentTrack = null;
    this.gainNode = null;
    this.activeNodes = [];
    this.volume = 0.5;
    this.lfoInterval = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  stop() {
    if (this.lfoInterval) {
      clearInterval(this.lfoInterval);
      this.lfoInterval = null;
    }

    if (!this.ctx) {
      this.currentTrack = null;
      return;
    }

    if (this.gainNode) {
      const now = this.ctx.currentTime;
      try {
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
        this.gainNode.gain.linearRampToValueAtTime(0.001, now + 0.3);
      } catch (e) {}

      setTimeout(() => {
        this.cleanupNodes();
        this.currentTrack = null;
      }, 350);
    } else {
      this.cleanupNodes();
      this.currentTrack = null;
    }
  }

  cleanupNodes() {
    this.activeNodes.forEach(node => {
      try {
        if (typeof node.stop === 'function') node.stop();
        node.disconnect();
      } catch (e) {}
    });
    this.activeNodes = [];
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.gainNode && this.ctx) {
      const now = this.ctx.currentTime;
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
      this.gainNode.gain.linearRampToValueAtTime(this.volume * 0.4, now + 0.05);
    }
  }

  // 1. Binaural Beats (Alpha, Beta, Theta)
  playBinaural(baseFreq, beatOffset, trackName) {
    this.init();
    this.stop();

    setTimeout(() => {
      this.currentTrack = trackName;
      const now = this.ctx.currentTime;

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.linearRampToValueAtTime(this.volume * 0.35, now + 0.4);
      masterGain.connect(this.ctx.destination);
      this.gainNode = masterGain;

      // Left Channel
      const oscL = this.ctx.createOscillator();
      oscL.type = 'sine';
      oscL.frequency.setValueAtTime(baseFreq, now);

      // Right Channel (offset creates the target brainwave beat)
      const oscR = this.ctx.createOscillator();
      oscR.type = 'sine';
      oscR.frequency.setValueAtTime(baseFreq + beatOffset, now);

      if (this.ctx.createStereoPanner) {
        const pannerL = this.ctx.createStereoPanner();
        pannerL.pan.setValueAtTime(-0.85, now);
        oscL.connect(pannerL);
        pannerL.connect(masterGain);

        const pannerR = this.ctx.createStereoPanner();
        pannerR.pan.setValueAtTime(0.85, now);
        oscR.connect(pannerR);
        pannerR.connect(masterGain);
      } else {
        oscL.connect(masterGain);
        oscR.connect(masterGain);
      }

      oscL.start(now);
      oscR.start(now);
      this.activeNodes = [oscL, oscR];
    }, 150);
  }

  // 2. Gentle Rainfall (Filtered Pink Noise)
  playRain() {
    this.init();
    this.stop();

    setTimeout(() => {
      this.currentTrack = 'Rain';
      const now = this.ctx.currentTime;

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.linearRampToValueAtTime(this.volume * 0.32, now + 0.6);
      masterGain.connect(this.ctx.destination);
      this.gainNode = masterGain;

      // 5-second pink noise buffer
      const bufferSize = this.ctx.sampleRate * 5;
      const noiseBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);

      for (let channel = 0; channel < 2; channel++) {
        const output = noiseBuffer.getChannelData(channel);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        }
      }

      const whiteNoiseSource = this.ctx.createBufferSource();
      whiteNoiseSource.buffer = noiseBuffer;
      whiteNoiseSource.loop = true;

      // Lowpass filter to simulate rain drops on foliage
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100, now);

      whiteNoiseSource.connect(filter);
      filter.connect(masterGain);
      whiteNoiseSource.start(now);
      this.activeNodes = [whiteNoiseSource, filter];
    }, 150);
  }

  // 3. Ocean Waves (LFO Modulated Pink Noise)
  playOcean() {
    this.init();
    this.stop();

    setTimeout(() => {
      this.currentTrack = 'Ocean';
      const now = this.ctx.currentTime;

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.linearRampToValueAtTime(this.volume * 0.3, now + 0.6);
      masterGain.connect(this.ctx.destination);
      this.gainNode = masterGain;

      // Pink noise buffer
      const bufferSize = this.ctx.sampleRate * 4;
      const noiseBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
      for (let channel = 0; channel < 2; channel++) {
        const output = noiseBuffer.getChannelData(channel);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99 * b0 + white * 0.08;
          b1 = 0.95 * b1 + white * 0.12;
          b2 = 0.85 * b2 + white * 0.2;
          output[i] = (b0 + b1 + b2) * 0.08;
        }
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      // Swell filter modulated by oscillator
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);

      // Low frequency oscillator for wave swell (0.12 Hz = ~8 second wave cycle)
      const swellOsc = this.ctx.createOscillator();
      swellOsc.frequency.setValueAtTime(0.12, now);

      const swellGain = this.ctx.createGain();
      swellGain.gain.setValueAtTime(320, now);

      swellOsc.connect(swellGain);
      swellGain.connect(filter.frequency);

      noiseSource.connect(filter);
      filter.connect(masterGain);

      noiseSource.start(now);
      swellOsc.start(now);
      this.activeNodes = [noiseSource, filter, swellOsc, swellGain];
    }, 150);
  }

  // 4. Forest Stream (Gentle Water Trickle)
  playForest() {
    this.init();
    this.stop();

    setTimeout(() => {
      this.currentTrack = 'Forest';
      const now = this.ctx.currentTime;

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.linearRampToValueAtTime(this.volume * 0.28, now + 0.6);
      masterGain.connect(this.ctx.destination);
      this.gainNode = masterGain;

      const bufferSize = this.ctx.sampleRate * 4;
      const noiseBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
      for (let channel = 0; channel < 2; channel++) {
        const output = noiseBuffer.getChannelData(channel);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.07;
        }
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(1400, now);
      bandpass.Q.setValueAtTime(1.8, now);

      noiseSource.connect(bandpass);
      bandpass.connect(masterGain);
      noiseSource.start(now);
      this.activeNodes = [noiseSource, bandpass];
    }, 150);
  }

  // 5. White Noise (Maximum Distraction Cancellation)
  playWhiteNoise() {
    this.init();
    this.stop();

    setTimeout(() => {
      this.currentTrack = 'WhiteNoise';
      const now = this.ctx.currentTime;

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.linearRampToValueAtTime(this.volume * 0.2, now + 0.5);
      masterGain.connect(this.ctx.destination);
      this.gainNode = masterGain;

      const bufferSize = this.ctx.sampleRate * 3;
      const noiseBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
      for (let channel = 0; channel < 2; channel++) {
        const output = noiseBuffer.getChannelData(channel);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.05;
        }
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, now);

      noiseSource.connect(filter);
      filter.connect(masterGain);
      noiseSource.start(now);
      this.activeNodes = [noiseSource, filter];
    }, 150);
  }

  // 6. Harmonic Meditation Chime (Celebratory sound for session completion)
  playChime() {
    try {
      this.init();
      const now = this.ctx.currentTime;
      const chimeGain = this.ctx.createGain();
      chimeGain.gain.setValueAtTime(0.35, now);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
      chimeGain.connect(this.ctx.destination);

      // 3 Harmonic Frequencies (528 Hz Solfeggio Love/Clarity frequency + harmonics)
      const freqs = [528, 1056, 1584];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        const indGain = this.ctx.createGain();
        indGain.gain.setValueAtTime(1 / (idx + 1.2), now);
        osc.connect(indGain);
        indGain.connect(chimeGain);
        osc.start(now);
        osc.stop(now + 3.2);
      });
    } catch (e) {
      console.warn('Audio chime could not play:', e);
    }
  }
}

export const focusAudio = new FocusAudioEngine();
export default focusAudio;

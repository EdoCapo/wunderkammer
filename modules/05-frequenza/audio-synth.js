/**
 * Wunderkammer — Room 05: Harmonic Drone Generator & Synesthetic Audio Synth
 * Sonifies 2D FFT spatial frequency bands using the Web Audio API
 */

export class FrequencyDroneSynth {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.oscillators = [];
    this.gainNodes = [];
    this.isPlaying = false;

    // Harmonic modal frequencies corresponding to bands 0 through 6
    // Rooted on A (55 Hz base drone)
    this.frequencies = [
      55.0,   // Band 0: Deep Sub-Bass Drone (A1)
      110.0,  // Band 1: Octave Foundation (A2)
      164.81, // Band 2: Perfect Fifth (E3)
      220.0,  // Band 3: Modal Octave (A3)
      277.18, // Band 4: Major Third (C#4)
      329.63, // Band 5: Fifth (E4)
      440.0,  // Band 6: Brilliant Overtone (A4)
    ];
  }

  init() {
    if (this.ctx) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    // Warm master compressor & lowpass filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, this.ctx.currentTime);

    this.masterGain.connect(filter);
    filter.connect(this.ctx.destination);

    // Create 7 sinusoidal harmonic drone oscillators
    for (let i = 0; i < 7; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = i < 2 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(this.frequencies[i], this.ctx.currentTime);

      gain.gain.setValueAtTime(0.0, this.ctx.currentTime);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();

      this.oscillators.push(osc);
      this.gainNodes.push(gain);
    }

    // Band 7: High frequency filtered noise for chaotic spatulas / fine texture
    this.initNoiseGenerator();
  }

  initNoiseGenerator() {
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(2400, this.ctx.currentTime);
    noiseFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.masterGain);
    whiteNoise.start();
  }

  toggle() {
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = !this.isPlaying;
    const targetGain = this.isPlaying ? 0.35 : 0.0;
    this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.15);
    return this.isPlaying;
  }

  /**
   * Updates drone volumes according to 8 radial FFT energy bands
   * @param {number[]} bands Array of 8 normalized energies [0..1]
   */
  updateBands(bands) {
    if (!this.ctx || !this.isPlaying) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < 7; i++) {
      const energy = bands[i] || 0;
      // Exponential volume curve for pleasant acoustic resonance
      const vol = Math.pow(energy, 1.6) * 0.18;
      this.gainNodes[i].gain.setTargetAtTime(vol, now, 0.08);
    }

    if (this.noiseGain) {
      const highFreqEnergy = bands[7] || 0;
      const noiseVol = Math.pow(highFreqEnergy, 2.0) * 0.06;
      this.noiseGain.gain.setTargetAtTime(noiseVol, now, 0.08);
    }
  }

  setMasterVolume(val) {
    if (!this.masterGain || !this.isPlaying) return;
    this.masterGain.gain.setTargetAtTime(val * 0.45, this.ctx.currentTime, 0.05);
  }
}

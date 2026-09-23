// Web Audio API telephone ring generator for emergency call alerts

class RingtoneService {
  constructor() {
    this.audioCtx = null;
    this.intervalId = null;
    this.isRinging = false;
  }

  init() {
    if (typeof window === 'undefined') return;
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  unlock() {
    this.init();
    if (this.audioCtx) {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      try {
        const buffer = this.audioCtx.createBuffer(1, 1, 22050);
        const source = this.audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioCtx.destination);
        source.start(0);
      } catch (e) {}
    }
  }

  playRingTone() {
    if (!this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      // Standard Indian/International dual tone frequencies: 440Hz + 480Hz
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(440, now);
      osc2.frequency.setValueAtTime(480, now);

      // Envelope: Ring for 1.8s, then silence
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gain.gain.setValueAtTime(0.2, now + 1.7);
      gain.gain.linearRampToValueAtTime(0, now + 1.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.85);
      osc2.stop(now + 1.85);
    } catch (err) {
      console.warn("Failed to generate ringtone pulse:", err);
    }
  }

  startRing() {
    if (this.isRinging) return;
    try {
      this.init();
      this.isRinging = true;
      this.playRingTone();
      // Repeat ring tone every 3.8 seconds (1.8s ring + 2s pause)
      this.intervalId = setInterval(() => {
        if (this.isRinging) {
          this.playRingTone();
        }
      }, 3800);
    } catch (e) {
      console.warn("Ringtone failed to start:", e);
    }
  }

  stopRing() {
    this.isRinging = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const ringtoneService = new RingtoneService();

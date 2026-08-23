/**
 * Atmospheric Romantic Web Audio Soundscape & Interactive FX
 * Uses pure Web Audio API synthesis - no external audio files required!
 */
class RomanticAudioEngine {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.isMuted = false;
        this.masterGain = null;
        this.musicGain = null;
        this.fxGain = null;
        this.ambientInterval = null;
        this.currentNoteIndex = 0;
        this.isInitialized = false;

        // Pentatonic / Romantic Dreamy Melody Frequencies (C Major / A Minor romantic dreamscape)
        this.scaleNotes = [
            261.63, // C4
            293.66, // D4
            329.63, // E4
            392.00, // G4
            440.00, // A4
            523.25, // C5
            587.33, // D5
            659.25, // E5
            783.99, // G5
            880.00, // A5
            1046.50 // C6
        ];

        // Romantic Chord progressions [Root, 3rd, 5th, 7th/9th]
        this.chords = [
            [261.63, 329.63, 392.00, 523.25, 659.25], // Cmaj7/9
            [220.00, 261.63, 329.63, 440.00, 523.25], // Am7
            [174.61, 220.00, 261.63, 329.63, 392.00], // Fmaj7
            [196.00, 246.94, 293.66, 392.00, 493.88], // Gsus/G
        ];
        this.currentChordIndex = 0;
    }

    init() {
        if (this.isInitialized) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        this.ctx = new AudioContext();

        // Master Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        // Music & FX bus
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(0.28, this.ctx.currentTime);
        this.musicGain.connect(this.masterGain);

        this.fxGain = this.ctx.createGain();
        this.fxGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        this.fxGain.connect(this.masterGain);

        this.isInitialized = true;
    }

    async startBackgroundMusic() {
        this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
        if (this.isPlaying) return;
        this.isPlaying = true;

        this.playChordPad();
        this.scheduleAmbientMelody();
    }

    stopBackgroundMusic() {
        this.isPlaying = false;
        if (this.ambientInterval) {
            clearInterval(this.ambientInterval);
            this.ambientInterval = null;
        }
    }

    toggleMute() {
        this.init();
        this.isMuted = !this.isMuted;
        if (this.masterGain && this.ctx) {
            const targetGain = this.isMuted ? 0.0001 : 0.7;
            this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
        }
        return this.isMuted;
    }

    playChordPad() {
        if (!this.isPlaying || !this.ctx || this.isMuted) return;

        const chord = this.chords[this.currentChordIndex];
        this.currentChordIndex = (this.currentChordIndex + 1) % this.chords.length;

        chord.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(freq / 2, this.ctx.currentTime); // Lower octave for warm pad

            // Filter for soothing, dreamy warm tone
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(450, this.ctx.currentTime);
            filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

            // Slow attack & long release
            const now = this.ctx.currentTime;
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.045 / chord.length, now + 2.5);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 7.5);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain);

            osc.start(now);
            osc.stop(now + 8.0);
        });

        if (this.isPlaying) {
            setTimeout(() => this.playChordPad(), 6500);
        }
    }

    scheduleAmbientMelody() {
        const playNextPluck = () => {
            if (!this.isPlaying) return;
            // Play 1 or 2 gentle chime notes
            const count = Math.random() > 0.6 ? 2 : 1;
            for (let i = 0; i < count; i++) {
                setTimeout(() => {
                    if (this.isPlaying) {
                        const noteFreq = this.scaleNotes[Math.floor(Math.random() * this.scaleNotes.length)];
                        this.playHarpNote(noteFreq, 0.08, 2.5);
                    }
                }, i * 320);
            }

            const nextTime = 1200 + Math.random() * 2400;
            this.ambientInterval = setTimeout(playNextPluck, nextTime);
        };
        playNextPluck();
    }

    playHarpNote(freq, volume = 0.1, duration = 2.0) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const oscHarmonic = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        oscHarmonic.type = 'triangle';
        oscHarmonic.frequency.setValueAtTime(freq * 2, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.frequency.exponentialRampToValueAtTime(300, now + duration);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(volume, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(filter);
        oscHarmonic.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(now);
        oscHarmonic.start(now);
        osc.stop(now + duration + 0.1);
        oscHarmonic.stop(now + duration + 0.1);
    }

    // --- Interactive Sound Effects ---

    playGiftUnwrapSound() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // Shimmering arpeggio ascending
        const notes = [392, 523.25, 659.25, 783.99, 1046.5, 1318.5];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);

            gain.gain.setValueAtTime(0.001, now + idx * 0.08);
            gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.2);

            osc.connect(gain);
            gain.connect(this.fxGain);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 1.3);
        });
    }

    playBloomBurstSound() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // Magical wind chime bloom
        const chord = [523.25, 659.25, 783.99, 987.77, 1174.66, 1318.51];
        chord.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.05);

            gain.gain.setValueAtTime(0.001, now + idx * 0.05);
            gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.05 + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 2.0);

            osc.connect(gain);
            gain.connect(this.fxGain);
            osc.start(now + idx * 0.05);
            osc.stop(now + idx * 0.05 + 2.2);
        });
    }

    playWaxSealSound() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // Subtle gentle snap and paper swish
        const bufferSize = this.ctx.sampleRate * 0.2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.Q.setValueAtTime(3.0, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(this.fxGain);

        whiteNoise.start(now);
        whiteNoise.stop(now + 0.22);

        // Accompanying sweet chime
        this.playHarpNote(880, 0.09, 1.8);
    }

    playPetalClickSound() {
        this.init();
        if (!this.ctx) return;
        const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
        const randomNote = pentatonic[Math.floor(Math.random() * pentatonic.length)];
        this.playHarpNote(randomNote, 0.12, 1.6);
    }

    playSparkleSound() {
        this.init();
        if (!this.ctx) return;
        const note = 1046.50 + Math.random() * 500;
        this.playHarpNote(note, 0.05, 0.8);
    }
}

window.romanticAudio = new RomanticAudioEngine();

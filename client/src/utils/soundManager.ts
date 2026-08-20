import * as Tone from 'tone';

class SoundManager {
  private isMuted: boolean = false;
  private isInitialized: boolean = false;

  private clickSynth: Tone.MembraneSynth | null = null;
  private successSynth: Tone.PolySynth | null = null;
  private errorSynth: Tone.MembraneSynth | null = null;
  private volumeNode: Tone.Volume | null = null;

  private async init() {
    if (typeof window === 'undefined' || this.isInitialized) return;
    
    try {
      await Tone.start();
      
      this.volumeNode = new Tone.Volume(-8).toDestination();

      // Çok hafif, yumuşak bir "tık" sesi (cam hissi, modern UI click)
      this.clickSynth = new Tone.MembraneSynth({
        pitchDecay: 0.005,
        octaves: 1,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.01 }
      }).connect(this.volumeNode);
      this.clickSynth.volume.value = -12; // Ekstra kısık, rahatsız etmeyen seviye

      // Zengin, yumuşak bir çan sesi (başarı / doğru cevap)
      this.successSynth = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 3,
        modulationIndex: 2,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.8 },
        modulation: { type: 'triangle' },
        modulationEnvelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 }
      }).connect(this.volumeNode);
      this.successSynth.volume.value = -10;

      // Tok, yumuşak bir bas vurumu (hata / yanlış cevap)
      this.errorSynth = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 2,
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.2, sustain: 0, release: 0.2 }
      }).connect(this.volumeNode);
      this.errorSynth.volume.value = -5;

      this.isInitialized = true;
    } catch (e) {
      console.warn('Tone.js başlatılamadı:', e);
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('medsim_sound_muted', this.isMuted ? '1' : '0');
    }
    return this.isMuted;
  }

  public getIsMuted() {
    return this.isMuted;
  }

  public checkLocalMuteState() {
    if (typeof window !== 'undefined') {
      const state = localStorage.getItem('medsim_sound_muted');
      if (state === '1') this.isMuted = true;
    }
  }

  // Hover sesleri kaldırıldı
  public playHover() {
    // No-op
  }

  public playClick() {
    if (this.isMuted) return;
    this.init().then(() => {
      if (this.clickSynth && Tone.context.state === 'running') {
        // C5 notası, çok kısa bir sürede
        this.clickSynth.triggerAttackRelease("C5", "32n");
      }
    });
  }

  public playSuccess() {
    if (this.isMuted) return;
    this.init().then(() => {
      if (this.successSynth && Tone.context.state === 'running') {
        // Güzel bir major akor (C5, E5, G5)
        this.successSynth.triggerAttackRelease(["C5", "E5", "G5"], "8n");
      }
    });
  }

  public playError() {
    if (this.isMuted) return;
    this.init().then(() => {
      if (this.errorSynth && Tone.context.state === 'running') {
        // Düşük, tok bir D2 notası
        this.errorSynth.triggerAttackRelease("D2", "8n");
      }
    });
  }

  public enableAudio() {
    this.init();
  }
}

export const soundManager = new SoundManager();

if (typeof window !== 'undefined') {
  soundManager.checkLocalMuteState();
}

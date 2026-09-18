// Web Audio API & HTML5 Browser Notification utility for Merchant Incoming Orders

class MerchantOrderNotificationService {
  private audioCtx: AudioContext | null = null;
  private loopIntervalId: number | null = null;
  private isSoundMuted: boolean = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtxClass) {
          this.audioCtx = new AudioCtxClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    } catch (e) {
      console.warn('AudioContext initialization error:', e);
      return null;
    }
  }

  public setSoundMuted(muted: boolean) {
    this.isSoundMuted = muted;
    if (muted) {
      this.stopLoopingOrderAlert();
    }
  }

  public getSoundMuted(): boolean {
    return this.isSoundMuted;
  }

  // Play rich 3-tone POS kitchen chime ("Ding-Dong-Ding!")
  public playOrderAlertChime(): void {
    if (this.isSoundMuted) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // High-clarity pleasant POS bell frequencies (F5, A5, C6)
      const notes = [
        { freq: 698.46, start: 0.00, dur: 0.22, type: 'triangle' as OscillatorType },
        { freq: 880.00, start: 0.12, dur: 0.22, type: 'sine' as OscillatorType },
        { freq: 1046.50, start: 0.24, dur: 0.45, type: 'triangle' as OscillatorType },
        // Secondary echo
        { freq: 880.00, start: 0.50, dur: 0.25, type: 'sine' as OscillatorType },
        { freq: 1318.51, start: 0.65, dur: 0.55, type: 'triangle' as OscillatorType },
      ];

      notes.forEach(({ freq, start, dur, type }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now + start);

        // Envelope: quick attack, smooth decay
        gain.gain.setValueAtTime(0.001, now + start);
        gain.gain.linearRampToValueAtTime(0.35, now + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + start);
        osc.stop(now + start + dur + 0.05);
      });
    } catch (err) {
      console.warn('Could not play order alert sound:', err);
    }
  }

  // Start continuous alert chime loop (repeats every 3.2 seconds until acknowledged)
  public startLoopingOrderAlert(): void {
    if (this.loopIntervalId !== null) return;
    this.playOrderAlertChime();
    this.loopIntervalId = window.setInterval(() => {
      this.playOrderAlertChime();
    }, 3200);
  }

  // Stop the alert loop
  public stopLoopingOrderAlert(): void {
    if (this.loopIntervalId !== null) {
      window.clearInterval(this.loopIntervalId);
      this.loopIntervalId = null;
    }
  }

  // Check current browser notification permission
  public getBrowserNotificationPermission(): NotificationPermission | 'unsupported' {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  // Request browser notification permission
  public async requestBrowserNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      console.warn('Error requesting notification permission:', e);
      return Notification.permission;
    }
  }

  // Trigger native desktop / browser notification
  public sendVisualBrowserNotification(
    title: string, 
    options?: {
      body?: string;
      icon?: string;
      tag?: string;
      onClick?: () => void;
    }
  ): Notification | null {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return null;
    }

    if (Notification.permission !== 'granted') {
      return null;
    }

    try {
      const notif = new Notification(title, {
        body: options?.body || 'มีออเดอร์ใหม่เข้ามา กรุณากดรับทราบทันที',
        icon: options?.icon || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=128&h=128&fit=crop',
        tag: options?.tag || `merchant-order-${Date.now()}`,
        requireInteraction: true, // Keep notification on desktop until user interacts
        silent: true, // Audio is synthesized separately via Web Audio API
      });

      notif.onclick = () => {
        window.focus();
        if (options?.onClick) {
          options.onClick();
        }
        notif.close();
      };

      return notif;
    } catch (e) {
      console.warn('Failed to fire browser notification:', e);
      return null;
    }
  }
}

export const merchantOrderAudio = new MerchantOrderNotificationService();

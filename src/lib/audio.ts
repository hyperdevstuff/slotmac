/**
 * All sound is synthesised with the Web Audio API — no audio files, matching the
 * "everything generated in code" approach of the reference projects.
 */
class Sfx {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private muted = false

  setMuted(muted: boolean) {
    this.muted = muted
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.7, this.ctx.currentTime, 0.01)
    }
  }

  /** must be called from a user gesture the first time */
  unlock() {
    this.ensure()
  }

  private ensure(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const Ctor: typeof AudioContext | undefined =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      this.ctx = new Ctor()
      this.master = this.ctx.createGain()
      this.master.gain.value = this.muted ? 0 : 0.7
      this.master.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
    return this.ctx
  }

  private tone(opts: {
    freq: number
    to?: number
    type?: OscillatorType
    dur: number
    gain?: number
    delay?: number
  }) {
    const ctx = this.ensure()
    if (!ctx || !this.master) return
    const t0 = ctx.currentTime + (opts.delay ?? 0)
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = opts.type ?? 'square'
    osc.frequency.setValueAtTime(opts.freq, t0)
    if (opts.to) osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.to), t0 + opts.dur)
    const peak = opts.gain ?? 0.2
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.006)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur)
    osc.connect(g).connect(this.master)
    osc.start(t0)
    osc.stop(t0 + opts.dur + 0.02)
  }

  private thud(freq: number, dur: number, gain: number, delay = 0) {
    const ctx = this.ensure()
    if (!ctx || !this.master) return
    const t0 = ctx.currentTime + delay
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, t0)
    osc.frequency.exponentialRampToValueAtTime(freq * 0.35, t0 + dur)
    g.gain.setValueAtTime(gain, t0)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    osc.connect(g).connect(this.master)
    osc.start(t0)
    osc.stop(t0 + dur + 0.02)
  }

  lever() {
    this.thud(180, 0.18, 0.5)
    this.tone({ freq: 900, to: 220, dur: 0.1, gain: 0.12, type: 'sawtooth' })
  }

  tick() {
    this.tone({ freq: 1400 + Math.random() * 260, dur: 0.03, gain: 0.07, type: 'square' })
  }

  stop() {
    this.thud(130, 0.22, 0.6)
    this.tone({ freq: 320, to: 120, dur: 0.09, gain: 0.16, type: 'square' })
  }

  win() {
    const notes = [523.25, 659.25, 783.99]
    notes.forEach((f, i) => this.tone({ freq: f, dur: 0.34, gain: 0.2, type: 'triangle', delay: i * 0.09 }))
  }

  jackpot() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98]
    notes.forEach((f, i) => this.tone({ freq: f, dur: 0.3, gain: 0.22, type: 'triangle', delay: i * 0.07 }))
    this.tone({ freq: 1567.98, dur: 0.9, gain: 0.14, type: 'sine', delay: 0.44 })
  }
}

export const sfx = new Sfx()

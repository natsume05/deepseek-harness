/**
 * Whale-song soundscape runtime: owns the Travelers' Encore audio element,
 * fades it in and out, writes the durable ambience preference through the
 * Host settings scope, and tracks the browser autoplay gesture — a persisted
 * `enabled` cannot start playback without a user gesture, so the snapshot
 * carries `pendingGesture` and the next click resumes instead of toggling.
 * The service never touches the DOM; AmbienceButton renders the snapshot.
 */

import type { Context } from '@deepseek-ai/cordis'
import type { SettingsScope } from '@deepseek-ai/dsh-client-runtime/client'
import {
  AMBIENCE_DEFAULT_VOLUME, AMBIENCE_ENABLED_FIELD, AMBIENCE_VOLUME_FIELD,
  type AmbienceSettings,
} from '../ambience-settings.ts'

/** Immutable ambience state published on every change. */
export interface AmbienceSnapshot {
  /** Whether the user wants the soundscape playing. */
  enabled: boolean
  /** Playback volume (0..1). */
  volume: number
  /** True while enabled but the browser withheld playback (no gesture yet). */
  pendingGesture: boolean
  /** Monotonic change counter. */
  revision: number
}

/** The whale-song ambience track, served from the web shell's public folder. */
export const AMBIENCE_SOURCE = '/audio/travelers-encore.mp3'

const FADE_INTERVAL_MS = 80
const FADE_IN_MS = 1500
const VOLUME_RAMP_MS = 150

/** Audio element factory, injectable so tests can stub media playback. */
export type AudioFactory = () => HTMLAudioElement

declare module '@deepseek-ai/cordis' {
  interface Context {
    ambience: AmbienceRuntime
  }
  interface Events {
    /**
     * Ambience state changed (toggle, volume, or autoplay-gesture state).
     * @param snapshot - Current immutable ambience snapshot.
     * @mode emit
     */
    'ambience/change'(snapshot: AmbienceSnapshot): void
  }
}

export class AmbienceRuntime {
  private readonly ctx: Context
  private readonly host: SettingsScope<AmbienceSettings>
  private readonly createAudio: AudioFactory
  private enabled = false
  private volume = AMBIENCE_DEFAULT_VOLUME
  private pendingGesture = false
  private revision = 0
  private snapshot: AmbienceSnapshot
  private audio: HTMLAudioElement | undefined
  private fadeTimer: ReturnType<typeof setInterval> | undefined

  /**
   * @param ctx - owning context (change events are emitted on it; the scope
   * listener is released through ctx.effect on dispose).
   * @param host - durable ambience scope owned by the same plugin.
   * @param createAudio - audio element factory (defaults to `new Audio()`).
   */
  constructor(ctx: Context, host: SettingsScope<AmbienceSettings>, createAudio: AudioFactory = () => new Audio()) {
    this.ctx = ctx
    this.host = host
    this.createAudio = createAudio
    this.snapshot = this.buildSnapshot()
    ctx.effect(() => host.subscribe(() => { this.adopt() }), 'ui-ambience: settings scope adoption')
    this.adopt()
  }

  /** @returns the current immutable ambience snapshot. */
  getAmbience(): AmbienceSnapshot {
    return this.snapshot
  }

  /**
   * Toggle the soundscape. A click is a user gesture, so enabling starts
   * playback immediately; when the browser still withholds it the snapshot
   * carries `pendingGesture` and the next toggle resumes instead of stopping.
   */
  async toggle(): Promise<void> {
    if (this.enabled && this.pendingGesture) {
      await this.tryPlay()
      this.publish()
      return
    }
    if (this.enabled) {
      this.enabled = false
      void this.host.set(AMBIENCE_ENABLED_FIELD, false)
      this.stop()
      this.publish()
      return
    }
    this.enabled = true
    void this.host.set(AMBIENCE_ENABLED_FIELD, true)
    await this.tryPlay()
    this.publish()
  }

  /** Set the durable volume and ramp the live element when playing. */
  setVolume(volume: number): void {
    const next = Math.min(1, Math.max(0, volume))
    if (next === this.volume) return
    this.volume = next
    void this.host.set(AMBIENCE_VOLUME_FIELD, next)
    if (this.audio !== undefined) this.fadeTo(this.audio, next, VOLUME_RAMP_MS)
    this.publish()
  }

  /** Adopt the scope's accepted durable section without writing it back. */
  private adopt(): void {
    const section = this.host.getSnapshot().value
    if (section === undefined) return
    const changed = this.enabled !== section.enabled || this.volume !== section.volume
    this.enabled = section.enabled
    this.volume = section.volume
    if (!changed) return
    if (this.enabled) void this.tryPlay()
    else this.stop()
    this.publish()
  }

  /** Start (or resume) playback with a fade-in; autoplay blocks flip pendingGesture. */
  private async tryPlay(): Promise<void> {
    const audio = this.ensureAudio()
    try {
      await audio.play()
      this.pendingGesture = false
      this.fadeTo(audio, this.volume, FADE_IN_MS)
    } catch {
      this.pendingGesture = true
    }
  }

  /** Pause and clear the fade ramp. Only runs after an enable created the
   * element (toggle/adopt -> tryPlay -> ensureAudio), so it is always live. */
  private stop(): void {
    this.pendingGesture = false
    this.clearFade()
    const audio = this.audio!
    audio.pause()
    audio.volume = 0
  }

  /** Lazily create the looped, metadata-preloaded audio element. */
  private ensureAudio(): HTMLAudioElement {
    if (this.audio !== undefined) return this.audio
    const audio = this.createAudio()
    audio.loop = true
    audio.preload = 'metadata'
    audio.src = AMBIENCE_SOURCE
    audio.volume = 0
    this.audio = audio
    return audio
  }

  /** Ramp the element volume over `ms`; a new ramp cancels the previous one. */
  private fadeTo(audio: HTMLAudioElement, target: number, ms: number): void {
    this.clearFade()
    const start = audio.volume
    const steps = Math.max(1, Math.round(ms / FADE_INTERVAL_MS))
    const delta = (target - start) / steps
    let remaining = steps
    this.fadeTimer = setInterval(() => {
      remaining -= 1
      audio.volume = Math.min(1, Math.max(0, audio.volume + delta))
      if (remaining <= 0) this.clearFade()
    }, FADE_INTERVAL_MS)
  }

  private clearFade(): void {
    if (this.fadeTimer !== undefined) {
      clearInterval(this.fadeTimer)
      this.fadeTimer = undefined
    }
  }

  private buildSnapshot(): AmbienceSnapshot {
    return {
      enabled: this.enabled,
      volume: this.volume,
      pendingGesture: this.pendingGesture,
      revision: this.revision,
    }
  }

  private publish(): void {
    this.revision += 1
    this.snapshot = this.buildSnapshot()
    this.ctx.emit('ambience/change', this.snapshot)
  }
}
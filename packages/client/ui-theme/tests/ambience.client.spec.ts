// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { stubSettingsScope } from '@deepseek-ai/dsh-client-test-runtime'
import { AMBIENCE_DEFAULT_VOLUME, type AmbienceSettings } from '../src/ambience-settings.ts'
import { AmbienceRuntime, AMBIENCE_SOURCE, type AmbienceSnapshot } from '../src/client/ambience.ts'

/** Stub media element with controllable playback (mocked play/pause). */
interface AudioStub {
  loop: boolean
  preload: string
  src: string
  volume: number
  play: ReturnType<typeof vi.fn>
  pause: ReturnType<typeof vi.fn>
}

function audioStub(): AudioStub {
  return {
    loop: false,
    preload: '',
    src: '',
    volume: 0,
    play: vi.fn(() => Promise.resolve()),
    pause: vi.fn(),
  }
}

const make = (host = stubSettingsScope<AmbienceSettings>()) => {
  const ctx = new Context()
  const events: AmbienceSnapshot[] = []
  ctx.on('ambience/change', (snapshot) => { events.push(snapshot) })
  const audio = audioStub()
  const ambience = new AmbienceRuntime(ctx, host.scope, () => audio as unknown as HTMLAudioElement)
  return { ctx, ambience, events, host, audio }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('AmbienceRuntime', () => {
  it('defaults to disabled with the default volume before any Host section', () => {
    const { ambience } = make()
    expect(ambience.getAmbience()).toEqual({
      enabled: false, volume: AMBIENCE_DEFAULT_VOLUME, pendingGesture: false, revision: 0,
    })
  })

  it('subscribes to the scope and adopts a published section without writing it back', () => {
    const { ambience, events, host } = make()
    expect(host.listenerCount()).toBe(1)
    host.publish({ status: 'ready', value: { enabled: true, volume: 0.6 }, revision: 1, writable: true })
    expect(ambience.getAmbience().enabled).toBe(true)
    expect(ambience.getAmbience().volume).toBe(0.6)
    expect(host.set).not.toHaveBeenCalled()
    expect(events).toHaveLength(1)
  })

  it('adopting an unchanged section republishes nothing', () => {
    const { ambience, events, host } = make()
    host.publish({ status: 'ready', value: { enabled: false, volume: AMBIENCE_DEFAULT_VOLUME }, revision: 1, writable: true })
    expect(ambience.getAmbience().revision).toBe(0)
    expect(events).toHaveLength(0)
  })

  it('toggle starts playback with a fade-in and writes through the scope', async () => {
    vi.useFakeTimers()
    const { ambience, events, host, audio } = make()
    await ambience.toggle()
    expect(ambience.getAmbience().enabled).toBe(true)
    expect(host.set).toHaveBeenCalledWith('enabled', true)
    expect(audio.play).toHaveBeenCalledOnce()
    expect(audio.loop).toBe(true)
    expect(audio.preload).toBe('metadata')
    expect(audio.src).toBe(AMBIENCE_SOURCE)
    expect(events).toHaveLength(1)
    // The fade ramps the volume from 0 toward the durable default.
    vi.advanceTimersByTime(80 * 10)
    expect(audio.volume).toBeGreaterThan(0)
    // Toggle again pauses and resets the element volume.
    await ambience.toggle()
    expect(audio.pause).toHaveBeenCalledOnce()
    expect(ambience.getAmbience().enabled).toBe(false)
    expect(host.set).toHaveBeenLastCalledWith('enabled', false)
    expect(audio.volume).toBe(0)
  })

  it('an autoplay block flips pendingGesture; the next toggle resumes instead of stopping', async () => {
    const { ambience, host, audio } = make()
    audio.play.mockRejectedValueOnce(new DOMException('blocked', 'NotAllowedError'))
    await ambience.toggle()
    expect(ambience.getAmbience().enabled).toBe(true)
    expect(ambience.getAmbience().pendingGesture).toBe(true)
    expect(host.set).toHaveBeenCalledWith('enabled', true)
    // A fresh user gesture resumes playback without disabling.
    await ambience.toggle()
    expect(ambience.getAmbience().pendingGesture).toBe(false)
    expect(ambience.getAmbience().enabled).toBe(true)
    expect(audio.play).toHaveBeenCalledTimes(2)
    expect(host.set).toHaveBeenCalledTimes(1)
  })

  it('setVolume clamps, writes through the scope, and ramps the live element', async () => {
    vi.useFakeTimers()
    const { ambience, host, audio } = make()
    await ambience.toggle()
    host.set.mockClear()
    ambience.setVolume(1.5)
    expect(host.set).toHaveBeenCalledWith('volume', 1)
    ambience.setVolume(1)
    expect(host.set).toHaveBeenCalledTimes(1)
    ambience.setVolume(0.5)
    expect(host.set).toHaveBeenLastCalledWith('volume', 0.5)
    const before = audio.volume
    vi.advanceTimersByTime(80 * 20)
    expect(audio.volume).toBeCloseTo(0.5)
    expect(audio.volume).not.toBe(before)
  })

  it('setVolume without a live element only writes', () => {
    const { ambience, host } = make()
    ambience.setVolume(0.3)
    expect(host.set).toHaveBeenCalledWith('volume', 0.3)
  })

  it('adopting a disabled section stops any playback and clears the ramp', () => {
    const { ambience, host, audio } = make()
    host.publish({ status: 'ready', value: { enabled: true, volume: 0.4 }, revision: 1, writable: true })
    expect(audio.play).toHaveBeenCalledOnce()
    host.publish({ status: 'ready', value: { enabled: false, volume: 0.4 }, revision: 2, writable: true })
    expect(ambience.getAmbience().enabled).toBe(false)
    expect(audio.pause).toHaveBeenCalledOnce()
    expect(audio.volume).toBe(0)
  })

  it('adopting an already-disabled section stays quiet', () => {
    const { ambience, host, audio } = make()
    host.publish({ status: 'ready', value: { enabled: false, volume: 0.4 }, revision: 1, writable: true })
    expect(ambience.getAmbience().enabled).toBe(false)
    expect(audio.pause).not.toHaveBeenCalled()
  })

  it('a new ramp cancels the previous one and the timer clears', async () => {
    vi.useFakeTimers()
    const { ambience, audio } = make()
    await ambience.toggle()
    ambience.setVolume(1)
    ambience.setVolume(0.2)
    vi.advanceTimersByTime(80 * 25)
    expect(audio.volume).toBeCloseTo(0.2)
  })
})
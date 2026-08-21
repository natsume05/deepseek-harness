# Agent Note: Whale-song theme - third visual track, star-traveler elements, Travelers' Encore ambience

Status: implemented

[English](2026-08-21-whale-song-theme.md) | [中文](2026-08-21-whale-song-theme.zh.md)

## Problem

The deep-space (`modern`) visual style made DeepSeek's whale a 34px hero logo inside a pretty nebula, but never the protagonist. The user asked for a bolder, dedicated theme built on the whale itself fused with Outer Wilds (星际拓荒) motifs, and decided three things up front: the theme is named 鲸歌 / Whale Song, the durable default visual style flips to `classic`, and a local mp3 (Outer Wilds "Travelers' Encore") becomes a background-music soundscape. The existing two-track system (`classic` / `modern`) had no home for a third, character-driven look, and the theme plugin had no audio surface.

## Decision

**A third visual style `whale-song`, default switches to `classic`.** `ui-theme.style` accepts `classic` / `modern` / `whale-song` (`VISUAL_STYLES` union, schema-validated); `DEFAULT_VISUAL_STYLE` becomes `classic` so new installs land on the plain pre-redesign snapshot and both character tracks stay opt-in. The switch remains a single `body[data-ds-visual-style]` attribute toggle with no re-render.

**Token double-track layered on the modern base.** `design-platform.css` adds `body[data-ds-visual-style="whale-song"]` and its `[data-ds-dark-theme]` intersection: abyss night base, biolum plankton, stardust/nebula with cyan accents, the distant Eye glow, planet-coded state colors (Giant's Deep cyan, Timber Hearth green, Ember Twin amber, Dark Bramble red), a sonar running indicator, and a light-track control accent (`--dsw-leviathan-accent`, rgb(11,104,120), 5.6:1 on the dawn base) so the volume slider passes non-text contrast while the dark track keeps the bright biolum cyan. `packages/client/web/src/base.css` composes the whale-song atmosphere layers. The scrollbar elevation contract holds for the new ladder (input-major/tip land on the whale-song rungs).

**The whale becomes the hero protagonist (ui-conversation).** The empty-session hero gains, whale-song only: a star halo (dashed ring + three pinprick stars) and comet wake around an enlarged whale with a slower cruise, the Eye-of-the-Universe signal (top-right pulse), a campfire with rising embers (bottom-left), a Nomai ring-glyph sigil divider, and a CSS-swapped slogan (`Follow the Signal` / 循着信号，潜入未知). All decorations are aria-hidden, token-colored, transform/opacity-only, hidden outside the track, and reduced-motion gated.

**Star-traveler element set.** A new `NomaiRing` primitive (12-tick decorative ring, currentColor) in ui-primitives; StateDot's ongoing state gains a sonar ring and the solid states read as ringed planets; the running stop button wears a rotating warm "sun" orbit (the 22-minute-loop abstraction).

**Whale-song ambience (ui-ambience).** A second durable settings namespace (`ui-ambience.enabled` / `.volume`, default volume 0.4) registered by the host half and bound by the client half. `AmbienceRuntime` owns the looped `/audio/travelers-encore.mp3` element (lazy creation, 1.5s fade-in, quick volume ramps, autoplay-gesture tracking: a persisted `enabled` cannot auto-play without a click, so the row shows a resume affordance with an attention dot). The controller row lives in the settings 外观/Appearance section (toggle + volume slider), persisted across sessions.

**Quantum collapse and wormhole switch.** The shell body crossfades its base color (180ms) on preference/style switches; the conversation replays a faint radial pulse (160ms) keyed by session id on every session switch.

## Alternatives considered

**Deepen `modern` into the whale theme.** Rejected: no rollback, would absorb the finished deep-space track, and cannot express "whale protagonist" without an opt-in surface.

**New `ui-ambience` package / sidebar-footer slot.** Partially rejected and adapted: a standalone package would need web-app profile wiring, and registering the footer action from ui-theme hits a TypeScript project-reference cycle (ui-theme -> ui-sidebar -> ui-layout -> ui-theme). The controller therefore lives in the settings Appearance section, which the theme feature already owns.

**Sidebar-footer quick toggle.** Deferred to a follow-up in ui-sidebar over the existing `ctx.ambience` service (footer slot is ui-sidebar-owned, so no new cycle there).

## Consequences

New installs default to `classic`; `whale-song` is a full third track with its own palette, atmosphere, hero scene, star elements, and soundscape. The ambience preference persists in `$DSH_HOME/settings.yaml` under `ui-ambience` and never reaches the model; autoplay is gesture-gated for WCAG 1.4.2 / 2.3.3. `test:gui` passes for all touched packages (the only local failures are sandbox-environment directory-picker cases in untouched packages); repo oxlint is clean on the touched surface. Browser-level `test:web` replay and three-track comparison screenshots still need a Playwright-equipped machine (Linux CI is the authoritative signal per the repo's Windows limitations note).

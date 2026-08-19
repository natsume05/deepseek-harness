# Agent Note: Visual style tracks (classic / modern) with instant rollback

Status: implemented

English | [中文](2026-08-15-visual-style-tracks-classic-modern.zh.md)

## Problem

The web UI redesign needs a way to ship new visuals without burning the bridge: users must keep the pre-redesign appearance (and the ability to return to it) after the upgrade. The theme chain owns exactly one preference dimension (`light`/`dark`/`system`) and the token sheets hold one value set, so switching between "old look" and "new look" would otherwise require rewriting components or maintaining two component trees.

## Decision

**The visual style is a second preference dimension, orthogonal to the color scheme.** `ui-theme.style` accepts `classic` (pre-redesign snapshot) or `modern` (default, the ongoing design). It persists through the same settings scope (`$DSH_HOME/settings.yaml` by default), rides the same `theme/change` event, and never reaches the model.

**Token double-track, not component forks.** `design-platform.css` keeps the default `body` blocks as the modern track (values evolve module by module) and freezes `body[data-ds-visual-style="classic"]` — plus the `[data-ds-dark-theme]` intersection — at the pre-redesign alias/specific values. The static palette is shared. A style switch is a single attribute toggle: no JavaScript token recomputation, no component remount.

**Runtime plumbing mirrors the color-scheme chain.** `ThemeRuntime` owns the style and publishes it in `ThemeSnapshot.style`; `ThemeRuntime.setStyle` writes through the settings scope. ui-layout's `ThemePresenter` toggles `body[data-ds-visual-style]` (attribute absent = modern) and retracts it on dispose. The Host boot script embeds both durable values so the first paint already carries the right track. The Appearance row gains a "visual style: classic / modern" selector under the theme cubes.

**Scale tokens live once.** `scales.css` (radius, spacing, motion, elevation, z-index, brand gradient, glass) is shared by both tracks; style differences stay in color/elevation alias values. `packages/client/web/src/base.css` imports it before `design-platform.css`.

**Rollback scope promise.** Classic covers the token values of every area that existed before the redesign; areas added during the redesign (command palette and later additions) share the new component styles under both tracks and only re-tint through the tokens.

## Alternatives considered

**Two component trees (classic UI vs modern UI).** Rejected: doubles maintenance of every component, makes behavior fixes diverge, and cannot share slot/store machinery.

**Runtime token overrides as the switch.** `ThemeRuntime.overrideTokens` already stacks layers, but it is the plugin-extension seam for partial adjustments; a complete look snapshot there would need a full alias dictionary pushed per switch and cannot express the CSS-double-track inheritance. The attribute-based CSS track is zero-cost at runtime and lets classic remain a plain stylesheet snapshot. Partial overrides remain available for third-party themes, untouched.

**Style as a third value of the theme preference.** Rejected: conflates two orthogonal axes (`light`/`dark`/`system` × `classic`/`modern`), complicates system resolution, and would force a redesign of the preference schema later.

## Consequences

New installs default to `modern`; the two tracks start value-identical and diverge as redesign modules land, with classic frozen at the pre-redesign look. The settings schema gains `ui-theme.style` (schemastery default `modern`; invalid values rejected at the settings boundary like `preference`). A style switch repaints through CSS only and never changes session-log output, so no snapshot fixtures change from the mechanism itself. Component CSS keeps zero theme selectors; the style track stays owned by ui-theme's sheets per the [web-styling system framework](../process/2026-07-19-web-styling-system.md), and persistence rides the [host-backed preferences boundary](../bug-fix/2026-08-06-host-backed-web-preferences.md).

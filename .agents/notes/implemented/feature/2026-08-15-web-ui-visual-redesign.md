# Agent Note: Web UI visual redesign implementation

Status: implemented

English | [中文](2026-08-15-web-ui-visual-redesign.zh.md)

## Problem

The Web GUI's visual language stopped at "functionally correct": token sheets lacked radius/spacing/motion/elevation scales, the three-column frame was flat, the conversation/input/sidebar surfaces carried no modern workbench texture, and motion was ad hoc. [UI_REDESIGN_PLAN.md](../../../../UI_REDESIGN_PLAN.md) scoped a staged redesign; this note records what shipped and what was deliberately cut.

## Decision

**Stage the redesign P1–P7 with the token system first and the classic/modern switch as the rollback guarantee** (the switch mechanism itself is [the visual-style tracks note](2026-08-15-visual-style-tracks-classic-modern.md)). Every change stayed in the presentation layer: feature CSS consumes `--dsw-alias-*` / `--dsw-*` tokens, zero data-layer or session-log edits, zero new model-visible inputs, and every animation gates on `prefers-reduced-motion` (component-level, plus a global backstop in `apps/web/src/base.css`).

Shipped surfaces: three-column card frame with an 8px gutter and enhanced drag handles; streaming caret, mount-time enter animation for the trailing message only (mount-captured `entering` + a memo comparator that ignores its churn, preserving the zero-re-render streaming contract), thinking-disclosure chevron rotation and expand fade, card-style markdown tables with header tint and zebra rows, brand-left-border blockquotes, code-block hairline, branded hero glow and gradient slogan, state-dot state easing, queue-dock hover/list fade, unified disclosure expand motion, input focus ring and error-red stop button, menu/modal entry motion with brand focus rings, sidebar active-row brand bar with the nav-item-active tint, and a brand-blue New Session primary button.

**Cut as low-margin or off-brand**: the ⌘K command palette (the existing `ui-commands` popup is already token-modern), BrandWordmark gradient (a precisely extracted SVG brand asset), per-icon grid unification, and skeleton shimmer (no current placeholder need). These remain recorded in the plan's implementation-status section for later recovery.

## Alternatives considered

**A full component-library or Tailwind adoption.** Rejected by the standing [web styling system framework](../process/2026-07-19-web-styling-system.md): CSS Modules + tokens are the constraint, not a choice.

**Rewriting components for each visual change.** Rejected: the slot/props discipline and the memo boundaries (streaming, tool rows) are behavioral contracts; the redesign rode them instead of reworking them.

## Consequences

The GUI now speaks one modern workbench language while the classic snapshot (`ui-theme.style = classic`) stays one settings click away. `test:gui` (273 files / 3792 tests), typecheck, and lint stay green across every stage; browser-level `test:web` replay shows no UI-structure regressions — its tool-layer failures on this Windows host are platform limits (bash/terminal unavailable), and Linux CI remains the authoritative replay signal. All work is pushed to the `ui-redesign` branch of the user's personal fork; the plan document's acceptance checklist records per-item status.

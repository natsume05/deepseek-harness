// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { NomaiRing } from '@deepseek-ai/dsh-client-ui-primitives'

afterEach(cleanup)

describe('NomaiRing', () => {
  it('renders a decorative ring with twelve ticks and four cardinal ticks', () => {
    const { container } = render(<NomaiRing />)
    const svg = container.firstElementChild as SVGSVGElement
    expect(svg.tagName).toBe('svg')
    expect(svg.getAttribute('aria-hidden')).toBe('true')
    expect(svg.querySelectorAll('circle')).toHaveLength(1)
    const ticks = svg.querySelectorAll('line')
    expect(ticks).toHaveLength(12)
    // The four cardinal ticks reach further inward (y2=5) than the rest (3.8).
    expect([...ticks].filter(t => t.getAttribute('y2') === '5')).toHaveLength(4)
  })

  it('sizes through the size prop', () => {
    const { container } = render(<NomaiRing size={16} />)
    const svg = container.firstElementChild as SVGSVGElement
    expect(svg.getAttribute('width')).toBe('16')
    expect(svg.getAttribute('height')).toBe('16')
  })
})
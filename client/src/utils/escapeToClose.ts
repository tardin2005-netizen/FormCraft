// Esc closes the topmost open dialog anywhere in the app.
// Every modal here is a full-screen fixed backdrop whose click closes it, so Esc clicks the topmost
// backdrop. If that backdrop doesn't close on click, the dialog's own close/cancel button is used.

const CLOSE_LABEL = /^(✕|×|x|fechar|cancelar|close)$/i

function isBackdrop(el: HTMLElement) {
  const cs = getComputedStyle(el)
  if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden' || cs.pointerEvents === 'none') return false
  if (Number(cs.opacity) < 0.05) return false
  const r = el.getBoundingClientRect()
  return r.width >= window.innerWidth * 0.95 && r.height >= window.innerHeight * 0.95
}

function zIndex(el: HTMLElement) {
  const z = Number(getComputedStyle(el).zIndex)
  return Number.isFinite(z) ? z : 0
}

function topmostBackdrop(): HTMLElement | null {
  const all = [...document.body.querySelectorAll<HTMLElement>('div, section, aside')].filter(isBackdrop)
  if (!all.length) return null
  // Highest z-index wins; on ties, the one later in the document is painted on top.
  return all.reduce((top, el) => (zIndex(el) >= zIndex(top) ? el : top))
}

function findCloseButton(backdrop: HTMLElement): HTMLElement | null {
  const scopes = [backdrop, backdrop.nextElementSibling].filter(Boolean) as Element[]
  for (const scope of scopes) {
    const btns = [...scope.querySelectorAll<HTMLElement>('button')]
    const byLabel = btns.find(b => /fechar|close/i.test(b.getAttribute('aria-label') ?? '') || /fechar|close/i.test(b.title))
    if (byLabel) return byLabel
    const byText = btns.find(b => CLOSE_LABEL.test(b.innerText.trim()))
    if (byText) return byText
  }
  return null
}

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape' || e.defaultPrevented || e.repeat) return
  const backdrop = topmostBackdrop()
  if (!backdrop) return
  backdrop.click()
  // Backdrops that ignore clicks: fall back to the dialog's own close button.
  window.setTimeout(() => {
    if (!document.body.contains(backdrop) || !isBackdrop(backdrop)) return
    findCloseButton(backdrop)?.click()
  }, 60)
})

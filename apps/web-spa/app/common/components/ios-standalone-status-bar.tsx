/**
 * iOS 27 paints a progressive blur over the top of an installed home-screen app.
 * WebKit drops that blur when a fixed, opaque box sits on the top edge:
 * within 4px of the screen top, at least 6px tall, and at least 80% of the width.
 * The status bar then uses this element's background color.
 */
export function IosStandaloneStatusBar() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[80] hidden h-3 bg-background [@media(display-mode:standalone)]:block"
    />
  )
}

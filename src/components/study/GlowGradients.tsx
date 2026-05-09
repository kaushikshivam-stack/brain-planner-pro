/**
 * Dynamic glowing gradient orbs that drift across the viewport.
 * GPU-only transforms, no JS animation loop.
 */
export function GlowGradients() {
  return (
    <div aria-hidden className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />
      <div className="glow-orb glow-orb-3" />
      <div className="glow-sweep" />
    </div>
  );
}

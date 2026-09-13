# Slot Machine Onboarding — Agent Handoff

## Objective
Implement an onboarding hero featuring a large, boxy, isometric slot machine. It begins small and offset toward the upper-right, then follows a smooth Bézier path toward the center, scales up to its full hero size, and completes exactly one 360° rotation.

Use `slot-machine-onboarding-reference.png` as the latest visual reference. The reference is a style/composition guide, not a pixel-perfect screen spec.

## Required stack
- Build the 3D machine in **Three.js**.
- Do not replace the machine with a 2D/SVG-only illustration.
- Use the project's existing framework and conventions.
- Prefer an orthographic camera for the crisp isometric illustration look.

## Machine design
Make the machine noticeably larger and more substantial than a small icon:
- A tall, chunky, rectangular cabinet with clear depth.
- A large, **boxy rectangular screen/reel window** with squared corners and a thick frame. Avoid a rounded or curved display.
- Three visible reels with simple symbols (e.g. cherry, 7, diamond).
- A prominent lever on the machine's right side, with a round handle.
- A substantial lower cabinet/box beneath the screen, including a coin tray or slot and a few simple controls.
- A top marquee/header above the screen.
- Use grouped meshes so the cabinet, screen, reels, lever, controls, and trim can be animated or adjusted independently.

## Visual direction
- Near-black background with generous negative space.
- Minimal technical/isometric 3D illustration, inspired by precise vector linework.
- Thin, crisp light-gray/white edges and restrained dark surfaces.
- Subtle blue accents on selected symbols or controls.
- Keep the machine visually dominant; avoid tiny proportions, excessive casino neon, photorealistic materials, and busy decoration.
- Use subtle ground/grid guides only if they support the composition.

## Onboarding animation
1. **Start:** machine is small and positioned in the upper-right quadrant, near but not at the center.
2. **Travel:** machine moves diagonally toward the visual center along a clearly curved cubic Bézier path.
3. **Scale:** smoothly increase from the small starting scale to the normal, large hero scale during travel.
4. **Rotation:** complete exactly one continuous 360° rotation around the machine's vertical axis while moving. The final orientation should match the intended hero-facing orientation.
5. **Settle:** decelerate smoothly into the final pose; avoid a pronounced bounce.
6. **Content:** coordinate the onboarding headline, supporting copy, progress indicator, and CTA with the machine's entrance so text remains readable.

## Motion implementation notes
- Put the complete machine under a `THREE.Group`.
- Use `THREE.CubicBezierCurve3` (or equivalent cubic Bézier math) for position.
- Drive position, scale, and rotation from one normalized progress value `t` in `[0, 1]`.
- Apply a smooth easing curve to `t`; derive all animated properties from the eased progress.
- Use elapsed time, not frame-count increments.
- Rotate by exactly `2 * Math.PI` over the animation, returning to the designed final facing direction.
- Make the animation play once on onboarding entry and avoid replaying on incidental framework rerenders.
- Keep the final pose stable after completion.

## Responsive and accessibility requirements
- Derive start/end positions from the available viewport/container; do not hardcode desktop-only pixels.
- On mobile, reduce travel distance and scale while keeping the machine fully visible and preserving the same motion story.
- Keep copy and controls clear of the machine's path.
- Respect `prefers-reduced-motion`: show the final machine pose immediately without the travel/spin.
- Provide a useful fallback if WebGL is unavailable.

## Acceptance checklist
- [ ] Machine is large and visually dominant at the final pose.
- [ ] Cabinet is boxy and substantial.
- [ ] Screen/reel window is clearly rectangular with squared corners and a thick frame.
- [ ] Lever is on the right side.
- [ ] A substantial lower box/cabinet sits beneath the screen.
- [ ] Machine starts small and offset upper-right.
- [ ] Machine follows a visibly curved Bézier path toward center.
- [ ] Machine scales smoothly to normal hero size.
- [ ] Exactly one 360° vertical rotation occurs during travel.
- [ ] Motion eases smoothly and settles without a large bounce.
- [ ] Layout adapts to mobile without clipping or obscuring copy/controls.
- [ ] Reduced-motion preference skips animated travel/spin.
- [ ] Machine is implemented in Three.js.

## Important clarification
The previous storyboard's multiple views are explanatory frames only. Implement one continuous animated machine, not a sequence of static images or hard cuts.

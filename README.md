# Flappy Car — Night Drive

A three-lane browser arcade game by Yusuf. Dodge traffic, find the open lane, and chase your personal best.

**[Play on yusufmm.com](https://yusufmm.com/flappycar/)** · [GitHub Pages](https://lego-man53.github.io/Car-Sim-FlappyBird/)

## What's new

- Detailed cars with body shading, glass, headlights, brake lights, and steering tilt.
- Night road with asphalt texture, roadside trees, streetlights, and crash sparks.
- Easy, Medium, and Hard modes with separately saved personal bests.
- Frame-rate-independent physics and collision detection based on the visible car position.
- Keyboard, touch buttons, tap steering, and swipe controls.
- Explicit start screen, pause/resume, and automatic pause when leaving the page.
- Optional sound (off by default), high-density canvas rendering, and reduced-motion support.
- No build step, tracking, accounts, or backend. Fonts use Google Fonts, with local system fallbacks.

## Controls

| Input | Action |
| --- | --- |
| Left / Right or A / D | Change lane |
| Space | Start, pause, resume, or retry after a crash |
| P | Pause / resume |
| Escape | Pause |
| Up | Start / retry |
| Touch arrows, tap road halves, or swipe | Steer |

Choose a difficulty to reset to the start screen. Each cleared traffic wave earns one point. Speed increases gradually. Every wave has an open lane.

## Run locally

Serve this folder with any static server, for example `python3 -m http.server 8000`, then open `http://localhost:8000`. GitHub Pages serves the files directly from the repository root.

## Validate

Run `node --test tests/game-core.test.cjs` (Node 18+). The tests cover lane bounds, actual-position collisions, scoring, pause, open lanes, cleanup, and frame-rate consistency.

`game-core.js` contains the simulation; `game.js` handles rendering, input, sound, and safe best-score storage. Storage failure does not prevent gameplay.

## Website copy

The personal website repository also hosts a copy under `flappycar/` so the game opens directly without an iframe. When updating the game, copy `index.html`, `styles.css`, `game-core.js`, and `game.js` together to that folder.

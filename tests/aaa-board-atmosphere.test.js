import test from 'node:test';
import assert from 'node:assert/strict';
import { BOARD_ATMOSPHERE_CSS } from '../src/aaa-board-atmosphere.js';

test('Board atmosphere stays decorative and geometry-neutral',()=>{
  assert.match(BOARD_ATMOSPHERE_CSS,/\.qa-board::before/);
  assert.match(BOARD_ATMOSPHERE_CSS,/\.qa-board::after/);
  assert.match(BOARD_ATMOSPHERE_CSS,/pointer-events:none/);
  assert.match(BOARD_ATMOSPHERE_CSS,/prefers-reduced-motion:reduce/);
  assert.match(BOARD_ATMOSPHERE_CSS,/animation:none/);
  assert.match(BOARD_ATMOSPHERE_CSS,/max-height:740px/);
  assert.doesNotMatch(BOARD_ATMOSPHERE_CSS,/\.merge-board\s*\{/);
  assert.doesNotMatch(BOARD_ATMOSPHERE_CSS,/\.board-cell\s*\{/);
  assert.doesNotMatch(BOARD_ATMOSPHERE_CSS,/grid-template-columns|grid-template-rows/);
});

test('Board atmosphere carries warm cool and green reflected light',()=>{
  assert.match(BOARD_ATMOSPHERE_CSS,/255,191,105/);
  assert.match(BOARD_ATMOSPHERE_CSS,/93,198,238/);
  assert.match(BOARD_ATMOSPHERE_CSS,/111,218,164/);
  assert.match(BOARD_ATMOSPHERE_CSS,/poply-board-ambient-drift/);
});

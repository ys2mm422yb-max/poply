import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css=readFileSync(new URL('../src/aaa-player.css',import.meta.url),'utf8');

test('completed milestone presentation uses an authored trophy rail instead of repeated card chrome',()=>{
  assert.match(css,/\.milestone-list::before\{[^}]*linear-gradient\(180deg,#ffb45c/);
  assert.match(css,/\.milestone-row\.complete:nth-child\(1\).*--milestone-accent:#ffbd72/);
  assert.match(css,/\.milestone-row\.complete:nth-child\(2\).*--milestone-accent:#78ece5/);
  assert.match(css,/\.milestone-row\.complete:nth-child\(4\).*--milestone-accent:#cdb1ff/);
  assert.match(css,/\.milestone-row\.complete\{[^}]*border-color:transparent/);
  assert.match(css,/\.milestone-row\.complete \.milestone-mark\{[^}]*border-radius:50%/);
});

test('milestone trophy rail preserves short-phone and reduced-motion treatment',()=>{
  assert.match(css,/@media\(max-height:740px\)\{\.milestone-list\{padding-left:3px\}/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\.milestone-row\.complete \.milestone-mark,\.milestone-row\.complete \.milestone-track i\{box-shadow:none\}\}/);
});

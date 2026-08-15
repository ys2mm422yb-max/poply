import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');

test('final stylesheet loads the user-driven vibrance layer last',()=>{
  const css=read('src/aaa.css');
  assert.match(css,/@import '\.\/aaa-integration\.css';\s*@import '\.\/aaa-vibrance\.css';\s*$/);
});

test('Board families own both persistent cell color and merge-effect color',()=>{
  const css=read('src/aaa-vibrance.css');
  for(const [family,rgb] of [['coffee','240,154,91'],['bakery','243,207,98'],['sweet','239,143,187'],['fruit','143,220,103']]){
    assert.match(css,new RegExp(`family-${family}\\{--fx-rgb:${rgb.replaceAll(',','\\,')}`));
    assert.match(css,new RegExp(`family-${family}:before`));
  }
  assert.match(css,/\.production-board \.board-cell\.merge-ready:before[\s\S]*var\(--fx-rgb/);
  assert.match(css,/\.board-cell\.fx-merge\{animation:poply-family-merge-snap/);
  assert.match(css,/\.board-cell\.fx-merge::after[\s\S]*var\(--fx-rgb/);
});

test('Board and Orders no longer resolve to a single petrol surface',()=>{
  const css=read('src/aaa-vibrance.css');
  assert.match(css,/\.production-board \.board-frame\{[\s\S]*157,124,244[\s\S]*255,158,105/);
  assert.match(css,/\.board-cell\.empty:nth-child\(4n\+3\)/);
  assert.match(css,/\.service-orders\{[\s\S]*255,139,104[\s\S]*160,125,244/);
  assert.match(css,/\.service-card\{[\s\S]*239,143,187/);
});

test('Places have persistent ambient life and reduced-motion safety',()=>{
  const css=read('src/aaa-vibrance.css');
  assert.match(css,/\.place-coast \.world-art::after[\s\S]*poply-coast-light/);
  assert.match(css,/\.place-sunset \.world-art::after[\s\S]*poply-sunset-light/);
  assert.match(css,/\.sunset-palms[\s\S]*poply-palms-sway/);
  assert.match(css,/\.scene-upgrade\.sunset-fire path[\s\S]*poply-fire-breathe/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)[\s\S]*animation:none!important/);
});

test('PWA shell exposes real app icons including maskable and Apple touch assets',()=>{
  const manifest=JSON.parse(read('manifest.webmanifest')),html=read('index.html');
  const sources=manifest.icons?.map(icon=>icon.src)||[];
  assert.ok(sources.includes('./assets/poply-icon-192.png'));
  assert.ok(sources.includes('./assets/poply-icon-512.png'));
  assert.ok(manifest.icons?.some(icon=>icon.src==='./assets/poply-icon-maskable-512.png'&&String(icon.purpose).includes('maskable')));
  assert.match(html,/rel="icon"[^>]*poply-icon-192\.png/);
  assert.match(html,/rel="apple-touch-icon"[^>]*apple-touch-icon\.png/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../src/v2-game.js';
import { ensureCollectionState } from '../src/aaa-collection.js';
import { collectionView, navWithCollection } from '../src/aaa-collection-view.js';

test('Collection Book renders known starting tiers and hides future names',()=>{
  const state=ensureCollectionState(createInitialState()).state,html=collectionView(state,'coffee');
  assert.match(html,/Deine Entdeckungen/);assert.match(html,/3\/24/);assert.match(html,/Getränke/);assert.match(html,/Kaffeebohnen/);assert.match(html,/1\/6/);
  assert.ok((html.match(/Noch entdecken/g)||[]).length>=5);assert.doesNotMatch(html,/Kaffeetasse/);
});

test('undiscovered fruit family is represented by six locked silhouettes',()=>{
  const state=ensureCollectionState(createInitialState()).state,html=collectionView(state,'fruit');
  assert.match(html,/Sonnenfrüchte/);assert.match(html,/0\/6/);assert.equal((html.match(/collection-tier locked/g)||[]).length,6);
});

test('Collection is a real fourth navigation destination',()=>{
  const base='<nav class="main-nav"><button class="nav-tab" data-view="board">Board</button></nav>';
  const html=navWithCollection('collection',base);assert.match(html,/data-view="collection"/);assert.match(html,/nav-collection active/);assert.match(html,/Sammlung/);
});

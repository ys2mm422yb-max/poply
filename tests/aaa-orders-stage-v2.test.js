import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createInitialState } from '../src/v2-game.js';
import { serviceStageFamilies } from '../src/aaa-orders-stage-v2.js';

const root=new URL('../',import.meta.url),read=path=>readFile(new URL(path,root),'utf8');

test('Orders Stage V2 derives deterministic primary and secondary families from the selected order',()=>{
  const state=createInitialState();
  const combo=state.currentOrders[1];
  const result=serviceStageFamilies(combo);
  assert.deepEqual(result.families,['bakery','coffee']);
  assert.equal(result.primary,'bakery');
  assert.equal(result.secondary,'coffee');

  const single=serviceStageFamilies(state.currentOrders[0]);
  assert.equal(single.primary,'coffee');
  assert.equal(single.secondary,'coffee');
});

test('unknown and duplicate requirements cannot invent visual family identities',()=>{
  const result=serviceStageFamilies({requirements:[{family:'coffee'},{family:'coffee'},{family:'unknown'}]});
  assert.deepEqual(result.families,['coffee']);
  assert.equal(result.primary,'coffee');
  assert.equal(result.secondary,'coffee');
});

test('Orders Stage V2 is a visual-only idempotent decorator with reduced-motion safety',async()=>{
  const [main,module,css,index,workflow,qa]=await Promise.all([
    read('src/aaa-main.js'),
    read('src/aaa-orders-stage-v2.js'),
    read('src/aaa-orders-stage-v2.css'),
    read('index.html'),
    read('.github/workflows/browser-qa.yml'),
    read('scripts/orders-stage-v2-qa.mjs'),
  ]);
  assert.match(main,/installOrdersStageV2\(root\)/);
  assert.match(module,/dataset\.servicePrimary/);
  assert.match(module,/orders-stage-set/);
  assert.match(module,/querySelector\(':scope > \.orders-stage-set'\)/);
  assert.doesNotMatch(module,/saveGameState|localStorage|coins|stars|energy|rewards\s*=/i);
  for(const family of ['coffee','bakery','sweet','fruit','herb'])assert.match(css,new RegExp(`data-service-primary="${family}"`));
  assert.match(css,/\.orders-stage-set\{[^}]*pointer-events:none/s);
  assert.match(css,/\.view-orders\[data-service-primary\] \.service-card:after/);
  assert.match(css,/\.service-reward-origin:before/);
  assert.match(css,/\.service-reward-origin:after/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(index,/aaa-orders-stage-v2\.css\?v=20260820-ordersstage1/);
  assert.match(index,/aaa-main\.js\?v=20260819-iphone1/);
  assert.match(index,/data-build="aaa-foundation-20260819-iphone1"/);
  assert.match(workflow,/Run Orders Stage V2 WebKit QA/);
  assert.match(workflow,/node scripts\/orders-stage-v2-qa\.mjs/);
  assert.match(qa,/330-orders-stage-missing-390x/);
  assert.match(qa,/331-orders-stage-ready-390x/);
  assert.match(qa,/332-orders-stage-reward-390x/);
});

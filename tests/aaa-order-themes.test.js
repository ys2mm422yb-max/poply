import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ORDER_PRESENTATIONS, orderPresentation, thematicOrderMarkup } from '../src/aaa-order-themes.js';

const root=new URL('../',import.meta.url),read=path=>readFile(new URL(path,root),'utf8');

test('all authored order titles resolve to deterministic coherent presentation metadata',()=>{
  assert.equal(Object.keys(ORDER_PRESENTATIONS).length,27);
  for(const [source,presentation] of Object.entries(ORDER_PRESENTATIONS)){
    assert.equal(orderPresentation(source),presentation);
    assert.ok(presentation.id);
    assert.ok(presentation.label);
    assert.ok(presentation.title);
    assert.ok(presentation.story.length>=24,`${source} needs a useful story`);
    assert.doesNotMatch(presentation.story,/\?$/);
  }
});

test('raw preparation items are described as preparation instead of finished dishes',()=>{
  assert.equal(orderPresentation('Frisches Gebäck').title,'Backstuben-Start');
  assert.match(orderPresentation('Frisches Gebäck').story,/Mehl vorbereiten/);
  assert.equal(orderPresentation('Kleine Pause').title,'Süße Vorbereitung');
  assert.match(orderPresentation('Kleine Pause').story,/Zucker vorbereiten/);
  assert.equal(orderPresentation('Limettenpause').title,'Fruchtmix-Pause');
  assert.equal(orderPresentation('Minzgruß').title,'Kräutergruß');
  assert.equal(orderPresentation('Blütenkaffee').title,'Gartenkaffee');
});

test('focused thematic markup is concise and unknown orders stay untouched',()=>{
  const markup=thematicOrderMarkup('Croissant & Kaffee');
  assert.match(markup,/data-order-theme="breakfast-prep"/);
  assert.match(markup,/FRÜHSTÜCK/);
  assert.match(markup,/klassisches Küstenfrühstück/);
  assert.equal(orderPresentation('Unbekannt'),null);
  assert.equal(thematicOrderMarkup('Unbekannt'),'');
});

test('thematic layer is presentation-only, loaded after the existing Orders stage, and does not add Board microcopy',async()=>{
  const [module,css,main,index,workflow,qa]=await Promise.all([
    read('src/aaa-order-themes.js'),
    read('src/aaa-order-themes.css'),
    read('src/aaa-main.js'),
    read('index.html'),
    read('.github/workflows/browser-qa.yml'),
    read('scripts/thematic-orders-qa.mjs'),
  ]);
  assert.match(module,/installOrderThemes/);
  assert.match(module,/\.customer-choice/);
  assert.match(module,/\.board-job/);
  assert.match(module,/\.service-card\[data-service-order\]/);
  assert.doesNotMatch(module,/saveGameState|localStorage|coins\s*=|stars\s*=|energy\s*=|Math\.random|setInterval/i);
  assert.match(css,/\.service-order-theme>p\{[^}]*font-size:11\.5px/s);
  assert.match(css,/\.service-orders\.has-service-call-ready \.service-order-theme,\.service-orders\.has-service-call-active \.service-order-theme\{display:none!important\}/);
  assert.match(main,/installOrdersStageV2\(root\);\ninstallOrderThemes\(root\);/);
  assert.match(index,/aaa-order-themes\.css\?v=20260821-themes1/);
  assert.match(workflow,/Run thematic Orders WebKit QA/);
  assert.match(qa,/340-thematic-order-focus-390x/);
  assert.match(qa,/341-thematic-order-board-390x/);
  assert.match(qa,/service-order-theme/);
  assert.match(qa,/assertNoScroll/);
});

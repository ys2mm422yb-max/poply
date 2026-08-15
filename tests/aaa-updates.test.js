import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fetchReleaseSha, shouldReloadForRelease } from '../src/aaa-updates.js';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('release comparison reloads only for a real newer canonical release',()=>{
  assert.equal(shouldReloadForRelease('abc','def'),true);
  assert.equal(shouldReloadForRelease('abc','abc'),false);
  assert.equal(shouldReloadForRelease(null,'def'),false);
  assert.equal(shouldReloadForRelease('development','def'),false);
  assert.equal(shouldReloadForRelease('abc','development'),false);
});

test('release marker reader requires a non-empty SHA',async()=>{
  assert.equal(await fetchReleaseSha(async()=>({ok:true,json:async()=>({sha:'  abc123  '})})),'abc123');
  assert.equal(await fetchReleaseSha(async()=>({ok:true,json:async()=>({sha:''})})),null);
  assert.equal(await fetchReleaseSha(async()=>({ok:false,json:async()=>({sha:'abc'})})),null);
});

test('installed Poply app uses stable identity and network-first automatic updates',async()=>{
  const [manifest,main,updates,worker,pages,release]=await Promise.all([
    read('manifest.webmanifest'),read('src/aaa-main.js'),read('src/aaa-updates.js'),read('sw.js'),read('.github/workflows/pages.yml'),read('release.json')
  ]);
  assert.equal(JSON.parse(manifest).id,'./');
  assert.match(main,/installAppUpdates\(\)\.catch/);
  assert.match(updates,/serviceWorker\.register\('\.\/sw\.js',\{scope:'\.\/',updateViaCache:'none'\}\)/);
  assert.match(updates,/visibilitychange/);
  assert.match(updates,/windowObj\.location\.reload\(\)/);
  assert.doesNotMatch(updates,/localStorage\.(?:clear|removeItem)/);
  assert.match(worker,/await fetch\(request,\{cache:'no-store'\}\)/);
  assert.match(worker,/await caches\.match\(request\)/);
  assert.match(worker,/clients\.claim\(\)/);
  assert.match(worker,/OFFLINE_RELEASE_BODY/);
  assert.match(worker,/if\(isRelease\)/);
  assert.match(worker,/status:200/);
  assert.match(worker,/'Cache-Control':'no-store'/);
  assert.match(pages,/Stamp canonical release/);
  assert.match(pages,/GITHUB_SHA/);
  assert.equal(JSON.parse(release).sha,'development');
});

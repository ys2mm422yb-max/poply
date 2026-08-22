import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CLIENT_RELEASE_STORAGE_KEY, fetchReleaseSha, releasePollingForWindow, releaseUrl, rememberRelease, serviceWorkerPaths, shouldReloadForRelease, shouldReloadForStoredRelease, storedRelease } from '../src/aaa-updates.js';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('release comparison reloads only for a real newer canonical release',()=>{
  assert.equal(shouldReloadForRelease('abc','def'),true);
  assert.equal(shouldReloadForRelease('abc','abc'),false);
  assert.equal(shouldReloadForRelease(null,'def'),false);
  assert.equal(shouldReloadForRelease('development','def'),false);
  assert.equal(shouldReloadForRelease('abc','development'),false);
});

test('cold-start release comparison catches a canonical deploy that happened while the app was closed',()=>{
  assert.equal(shouldReloadForStoredRelease('old-release','new-release'),true);
  assert.equal(shouldReloadForStoredRelease('new-release','new-release'),false);
  assert.equal(shouldReloadForStoredRelease(null,'new-release'),false);
  assert.equal(shouldReloadForStoredRelease('development','new-release'),false);
  assert.equal(shouldReloadForStoredRelease('old-release','development'),false);
});

test('canonical client release marker is isolated from gameplay save and tolerant of storage failures',()=>{
  const values=new Map();
  const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
  assert.equal(storedRelease(storage),null);
  assert.equal(rememberRelease(storage,'release-a'),true);
  assert.equal(values.get(CLIENT_RELEASE_STORAGE_KEY),'release-a');
  assert.equal(storedRelease(storage),'release-a');
  assert.equal(rememberRelease(storage,'development'),false);
  assert.equal(storedRelease(storage),'release-a');
  const blocked={getItem(){throw new Error('blocked');},setItem(){throw new Error('blocked');}};
  assert.equal(storedRelease(blocked),null);
  assert.equal(rememberRelease(blocked,'release-b'),false);
});

test('automatic release polling is production HTTPS behavior, not local QA traffic',()=>{
  assert.equal(releasePollingForWindow({location:{protocol:'https:'}}),true);
  assert.equal(releasePollingForWindow({location:{protocol:'http:'}}),false);
  assert.equal(releasePollingForWindow({location:{protocol:'file:'}}),false);
  assert.equal(releasePollingForWindow(null),false);
});

test('release marker URL stays on the app origin and preserves the GitHub Pages subpath',()=>{
  assert.equal(releaseUrl('https://ys2mm422yb-max.github.io/poply/src/aaa-updates.js'),'https://ys2mm422yb-max.github.io/poply/release.json');
  assert.equal(releaseUrl('http://127.0.0.1:4173/src/aaa-updates.js'),'http://127.0.0.1:4173/release.json');
});

test('service worker registration uses origin-relative paths and preserves app subpaths',()=>{
  assert.deepEqual(serviceWorkerPaths('http://127.0.0.1:4173/'),{workerUrl:'/sw.js',workerScope:'/'});
  assert.deepEqual(serviceWorkerPaths('https://ys2mm422yb-max.github.io/poply/'),{workerUrl:'/poply/sw.js',workerScope:'/poply/'});
  assert.deepEqual(serviceWorkerPaths('https://example.test/poply/index.html'),{workerUrl:'/poply/sw.js',workerScope:'/poply/'});
});

test('release marker reader requires a non-empty SHA and uses an absolute same-origin URL',async()=>{
  const calls=[];
  const fetchImpl=async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>({sha:'  abc123  '})};};
  assert.equal(await fetchReleaseSha(fetchImpl,'http://127.0.0.1:4173/src/aaa-updates.js'),'abc123');
  assert.deepEqual(calls,[{url:'http://127.0.0.1:4173/release.json',options:{cache:'no-store',credentials:'same-origin'}}]);
  assert.equal(await fetchReleaseSha(async()=>({ok:true,json:async()=>({sha:''})}),'https://example.test/poply/src/aaa-updates.js'),null);
  assert.equal(await fetchReleaseSha(async()=>({ok:false,json:async()=>({sha:'abc'})}),'https://example.test/poply/src/aaa-updates.js'),null);
});

test('installed Poply app uses stable identity, cold-start recovery and canonical deployment verification',async()=>{
  const [manifest,main,updates,worker,pages,release,rules]=await Promise.all([
    read('manifest.webmanifest'),read('src/aaa-main.js'),read('src/aaa-updates.js'),read('sw.js'),read('.github/workflows/pages.yml'),read('release.json'),read('PROJECT_RULES.md')
  ]);
  assert.equal(JSON.parse(manifest).id,'./');
  assert.match(main,/installAppUpdates\(\)\.catch/);
  assert.match(updates,/CLIENT_RELEASE_STORAGE_KEY='poply-client-release-v1'/);
  assert.match(updates,/shouldReloadForStoredRelease/);
  assert.match(updates,/rememberRelease\(storageObj,bootRelease\)/);
  assert.match(updates,/rememberRelease\(storageObj,latestRelease\)/);
  assert.match(updates,/const documentBase=documentObj\.baseURI\|\|windowObj\.location\?\.href/);
  assert.match(updates,/serviceWorkerPaths\(documentBase\)/);
  assert.match(updates,/serviceWorker\.register\(workerUrl,\{scope:workerScope,updateViaCache:'none'\}\)/);
  assert.match(updates,/location\?\.protocol==='https:'/);
  assert.match(updates,/new URL\('\.\.\/release\.json',moduleUrl\)\.href/);
  assert.match(updates,/visibilitychange/);
  assert.match(updates,/windowObj\.location\.reload\(\)/);
  assert.doesNotMatch(updates,/localStorage\.(?:clear|removeItem)/);
  assert.match(worker,/CACHE_NAME='poply-runtime-v3'/);
  assert.match(worker,/fetch\(url\.href,\{cache:'no-store',credentials:'same-origin'\}\)/);
  assert.match(worker,/await fetch\(request,\{cache:'no-store'\}\)/);
  assert.match(worker,/await caches\.match\(request\)/);
  assert.match(worker,/clients\.claim\(\)/);
  assert.match(worker,/OFFLINE_RELEASE_BODY/);
  assert.match(worker,/if\(isRelease\)/);
  assert.match(worker,/offlineReleaseResponse/);
  assert.match(worker,/'Cache-Control':'no-store'/);
  assert.match(pages,/Stamp canonical release/);
  assert.match(pages,/Verify permanent test URL/);
  assert.match(pages,/https:\/\/ys2mm422yb-max\.github\.io\/poply/);
  assert.match(pages,/GITHUB_SHA/);
  assert.match(rules,/installed web app must update itself automatically/i);
  assert.equal(JSON.parse(release).sha,'development');
});

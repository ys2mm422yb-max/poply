import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root));

test('Poply exposes installable raster and maskable app icons',()=>{
  const manifest=JSON.parse(read('manifest.webmanifest').toString('utf8'));
  const png192=manifest.icons.find(icon=>icon.src==='./assets/poply-app-icon-192.png');
  const maskable=manifest.icons.find(icon=>icon.purpose==='maskable');
  assert.deepEqual({sizes:png192?.sizes,type:png192?.type,purpose:png192?.purpose},{sizes:'192x192',type:'image/png',purpose:'any'});
  assert.equal(maskable?.src,'./assets/poply-app-icon.svg');
  assert.equal(maskable?.type,'image/svg+xml');
});

test('browser and Apple homescreen icon files are real and wired from the shell',()=>{
  const html=read('index.html').toString('utf8');
  assert.match(html,/rel="icon" type="image\/png" sizes="192x192" href="\.\/assets\/poply-app-icon-192\.png"/);
  assert.match(html,/rel="apple-touch-icon" sizes="180x180" href="\.\/assets\/apple-touch-icon\.png"/);
  for(const path of ['assets/poply-app-icon-192.png','assets/apple-touch-icon.png']){
    const file=read(path);
    assert.ok(file.length>4096,`${path} is unexpectedly small`);
    assert.equal(file.subarray(0,8).toString('hex'),'89504e470d0a1a0a',`${path} is not a PNG`);
  }
});

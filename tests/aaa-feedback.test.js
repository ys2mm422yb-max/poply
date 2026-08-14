import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getFeedbackProfile, playFeedback } from '../src/aaa-feedback.js';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('feedback profiles cover the full Milestone C action loop',()=>{
  for(const cue of ['move','merge','spawn','delivery','reward','restoration','invalid']){
    const profile=getFeedbackProfile(cue);
    assert.ok(profile,`${cue} profile exists`);
    assert.ok(profile.haptic!==undefined,`${cue} has haptic feedback`);
    assert.ok(profile.tones.length>0,`${cue} has sound feedback`);
  }
  assert.equal(playFeedback('missing',{soundEnabled:false,hapticsEnabled:false}),false);
  assert.equal(playFeedback('merge',{soundEnabled:false,hapticsEnabled:false}),true);
});

test('AAA feedback is generated locally and respects reduced-motion for vibration',async()=>{
  const feedback=await read('src/aaa-feedback.js');
  assert.match(feedback,/AudioContext/);
  assert.match(feedback,/createOscillator/);
  assert.match(feedback,/navigator\?\.vibrate/);
  assert.match(feedback,/prefers-reduced-motion: reduce/);
  assert.doesNotMatch(feedback,/fetch\(|\.mp3|\.wav|https?:\/\//);
});

test('UI and drag route gameplay feedback through the centralized module',async()=>{
  const [ui,drag]=await Promise.all([read('src/aaa-ui.js'),read('src/aaa-drag.js')]);
  assert.match(ui,/import \{ playFeedback \} from '\.\/aaa-feedback\.js'/);
  for(const cue of ['spawn','delivery','reward','restoration','invalid'])assert.match(ui,new RegExp(`playFeedback\\('${cue}'\\)`));
  assert.match(drag,/ui\.feedback\(result\.type==='merge'\?'merge':'move'\)/);
  assert.match(drag,/ui\.feedback\('invalid'\)/);
  assert.doesNotMatch(ui,/const buzz=/);
});

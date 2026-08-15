import { webkit } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const baseURL=process.env.QA_BASE_URL||'http://127.0.0.1:4173';
const outDir=process.env.QA_OUT_DIR||'qa-artifacts';
await mkdir(outDir,{recursive:true});
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:'de-DE'});
const page=await context.newPage();
const problems=[];
page.on('console',msg=>{if(['error','warning'].includes(msg.type()))problems.push(`${msg.type()}: ${msg.text()}`);});
page.on('pageerror',error=>problems.push(`pageerror: ${error.message}`));
const assert=(value,message)=>{if(!value)throw new Error(message);};
const shot=name=>page.screenshot({path:`${outDir}/${name}.png`,fullPage:false});
const readSave=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('poply-v2-state-1')||'null'));
const seedReadyOrder=()=>page.evaluate(async()=>{
  const game=await import('./src/v2-game.js');
  const state=game.createInitialState();
  state.board[9]=game.makeItem('coffee',2,'qa-delivery-ready');
  state.board[10]=null;
  localStorage.setItem('poply-v2-state-1',JSON.stringify(state));
});
const center=box=>({x:box.x+box.width/2,y:box.y+box.height/2});
const assertShellFits=async label=>{
  const m=await page.evaluate(()=>{
    const rect=selector=>{const el=document.querySelector(selector);if(!el)return null;const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height};};
    return {height:window.visualViewport?.height||innerHeight,innerHeight,scrollHeight:document.documentElement.scrollHeight,app:rect('.app-shell'),view:rect('.game-view'),nav:rect('.main-nav')};
  });
  assert(m.app&&m.view&&m.nav,`${label}: shell missing ${JSON.stringify(m)}`);
  assert(m.app.bottom<=m.height+1,`${label}: app exceeds viewport ${JSON.stringify(m)}`);
  assert(m.nav.bottom<=m.height+1,`${label}: nav clipped ${JSON.stringify(m)}`);
  assert(m.scrollHeight<=m.innerHeight+1,`${label}: document scrolls ${JSON.stringify(m)}`);
  return m;
};
const runServe=async({label,dynamicShot,afterShot})=>{
  await seedReadyOrder();
  await page.reload({waitUntil:'networkidle'});
  await page.locator('.nav-tab[data-view="orders"]').click();
  await page.locator('[data-select-order="order-0"]').click();
  const serve=page.locator('button[data-order="order-0"]');
  await serve.waitFor({state:'visible'});
  assert(await serve.isEnabled(),`${label}: ready serve button disabled`);
  const rewardBox=await page.locator('.service-card[data-service-order="order-0"] .service-rewards').boundingBox();
  const starBefore=await page.locator('.resource.star').boundingBox();
  assert(rewardBox&&starBefore,`${label}: service reward or Star resource missing`);
  const origin=center(rewardBox),oldWrongOrigin=center(starBefore),before=await readSave();
  await serve.click();
  await page.waitForTimeout(390);
  const flightState=await page.evaluate(()=>{
    const payload=selector=>Array.from(document.querySelectorAll(selector)).map(el=>{
      const style=getComputedStyle(el),box=el.getBoundingClientRect();
      return {text:el.textContent||'',left:Number.parseFloat(el.style.left),top:Number.parseFloat(el.style.top),travelX:Number.parseFloat(el.style.getPropertyValue('--travel-x')),travelY:Number.parseFloat(el.style.getPropertyValue('--travel-y')),opacity:Number(style.opacity),box:{left:box.left,top:box.top,right:box.right,bottom:box.bottom,width:box.width,height:box.height}};
    });
    const target=selector=>{const el=document.querySelector(selector);if(!el)return null;const r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};};
    return {coins:payload('.delivery-flight.reward-flight.coin-flight'),stars:payload('.delivery-flight.reward-flight.star-flight'),bursts:payload('.reward-origin-burst'),coinTarget:target('.resource.coin'),starTarget:target('.resource.star')};
  });
  assert(flightState.coins.length===1,`${label}: expected one Coin reward flight ${JSON.stringify(flightState)}`);
  assert(flightState.stars.length===1,`${label}: expected one Star reward flight ${JSON.stringify(flightState)}`);
  assert(flightState.bursts.length===1,`${label}: service reward origin burst missing ${JSON.stringify(flightState)}`);
  const coin=flightState.coins[0],star=flightState.stars[0],burst=flightState.bursts[0];
  assert(coin.text.includes('+45'),`${label}: Coin flight reward copy wrong ${coin.text}`);
  assert(star.text.includes('+2'),`${label}: Star flight reward copy wrong ${star.text}`);
  assert(Math.abs(coin.left-(origin.x-15))<=3&&Math.abs(coin.top-origin.y)<=3,`${label}: Coin flight did not originate at service rewards ${JSON.stringify({origin,coin})}`);
  assert(Math.abs(star.left-(origin.x+15))<=3&&Math.abs(star.top-origin.y)<=3,`${label}: Star flight did not originate at service rewards ${JSON.stringify({origin,star})}`);
  assert(Math.abs(burst.left-origin.x)<=3&&Math.abs(burst.top-origin.y)<=3,`${label}: reward burst is not at service rewards ${JSON.stringify({origin,burst})}`);
  assert(Math.hypot(coin.left-oldWrongOrigin.x,coin.top-oldWrongOrigin.y)>100,`${label}: Coin reward still starts near old top-Star origin`);
  assert(flightState.coinTarget&&flightState.starTarget,`${label}: resource targets missing`);
  assert(Math.abs((coin.left+coin.travelX)-flightState.coinTarget.x)<=3&&Math.abs((coin.top+coin.travelY)-flightState.coinTarget.y)<=3,`${label}: Coin travel does not terminate at Coin resource ${JSON.stringify({coin,target:flightState.coinTarget})}`);
  assert(Math.abs((star.left+star.travelX)-flightState.starTarget.x)<=3&&Math.abs((star.top+star.travelY)-flightState.starTarget.y)<=3,`${label}: Star travel does not terminate at Star resource ${JSON.stringify({star,target:flightState.starTarget})}`);
  await assertShellFits(`${label} dynamic`);
  await shot(dynamicShot);

  await page.waitForTimeout(900);
  const after=await readSave();
  assert(after.coins===before.coins+45,`${label}: Coins wrong after delivery ${before.coins} -> ${after.coins}`);
  assert(after.stars===before.stars+2,`${label}: Stars wrong after delivery ${before.stars} -> ${after.stars}`);
  assert(!after.currentOrders.some(order=>order.id==='order-0'),`${label}: served order still active`);
  assert(!after.board.some(item=>item?.id==='qa-delivery-ready'),`${label}: served Board item still present`);
  assert(await page.locator('.delivery-flight.reward-flight').count()===0,`${label}: reward flights did not clear`);
  assert(await page.locator('.reward-origin-burst').count()===0,`${label}: reward burst did not clear`);
  const fit=await assertShellFits(`${label} settled`);
  await shot(afterShot);
  return {origin,oldWrongOrigin,flightState,fit,coinsBefore:before.coins,coinsAfter:after.coins,starsBefore:before.stars,starsAfter:after.stars};
};

let report={},failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  report.tall=await runServe({label:'390x844 delivery reward',dynamicShot:'70-delivery-reward-390x844',afterShot:'72-delivery-after-390x844'});
  await page.setViewportSize({width:390,height:720});await page.waitForTimeout(120);
  report.short=await runServe({label:'390x720 delivery reward',dynamicShot:'71-delivery-reward-short-safari',afterShot:'73-delivery-after-short-safari'});
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('79-delivery-reward-failure');}catch{}}
finally{
  await writeFile(`${outDir}/delivery-reward-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));
  await browser.close();
}
if(failure)throw failure;
console.log('Delivery reward WebKit QA passed.');

import { economySnapshot, economyGuardFailures } from '../src/aaa-economy.js';

const snapshot=economySnapshot();
const round=value=>Number(value.toFixed(2));
const report={
  generatedAt:new Date().toISOString(),
  chapters:Object.fromEntries(Object.entries(snapshot.chapters).map(([chapterId,data])=>[
    chapterId,
    {
      fullRestoration:{
        ordersServed:data.pacing.ordersServed,
        theoreticalEnergy:data.pacing.energy,
        coinsEarned:data.pacing.coins,
        starsLeft:data.pacing.starsLeft,
      },
      bands:data.bands.map(band=>({
        band:band.band,
        averageEnergy:round(band.averageEnergy),
        energyPerStar:round(band.energyPerStar),
        coinsPerEnergy:round(band.coinsPerEnergy),
      })),
    },
  ])),
  coreCoinJourney:{
    storage:snapshot.journey.storage,
    checkpoints:Object.fromEntries(Object.entries(snapshot.journey.checkpoints).map(([chapterId,data])=>[
      chapterId,
      {
        ordersServed:data.ordersServed,
        totalXp:data.totalXp,
        level:data.level,
        sources:data.sources,
        grossCoins:data.grossCoins,
        coinsAfterFullStorage:data.coinsAfterFullStorage,
      },
    ])),
    totals:snapshot.journey.totals,
  },
};
const failures=economyGuardFailures(snapshot);
console.log(JSON.stringify({...report,failures},null,2));
if(failures.length)process.exitCode=1;

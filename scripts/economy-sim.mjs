import { economySnapshot, economyGuardFailures } from '../src/aaa-economy.js';

const snapshot=economySnapshot();
const round=value=>Number(value.toFixed(2));
const runtimeTraceSummary=trace=>({
  completed:trace.completed,
  world:{
    ordersServed:trace.services,
    theoreticalEnergy:trace.energy,
    baseOrderCoins:trace.orderCoins,
    starsLeft:trace.starsLeft,
  },
  places:Object.fromEntries(Object.entries(trace.checkpoints).map(([chapterId,checkpoint])=>[
    chapterId,
    {
      ordersServed:checkpoint.delta.ordersServed,
      theoreticalEnergy:checkpoint.delta.energy,
      baseOrderCoins:checkpoint.delta.orderCoins,
      cumulativeOrders:checkpoint.services,
      cumulativeEnergy:checkpoint.energy,
      cumulativeOrderCoins:checkpoint.orderCoins,
      starsLeft:checkpoint.starsLeft,
    },
  ])),
  choicePressure:{
    maxSelectedEnergy:trace.maxSelectedEnergy,
    maxSelectedEnergyPerStar:round(trace.maxSelectedEnergyPerStar),
    maxLowestVisibleEnergy:trace.maxChoiceFloorEnergy,
    maxLowestVisibleEnergyPerStar:round(trace.maxChoiceFloorEnergyPerStar),
  },
  antiRepeatViolations:trace.antiRepeatViolations.length,
  queueSizeViolations:trace.queueSizeViolations.length,
});

const report={
  generatedAt:new Date().toISOString(),
  isolatedReference:Object.fromEntries(Object.entries(snapshot.chapters).map(([chapterId,data])=>[
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
  runtimeTraces:Object.fromEntries(Object.entries(snapshot.runtimeTraces).map(([policy,trace])=>[policy,runtimeTraceSummary(trace)])),
  conservativeCoreJourney:{
    policy:snapshot.journey.policy,
    storage:snapshot.journey.storage,
    checkpoints:Object.fromEntries(Object.entries(snapshot.journey.checkpoints).map(([chapterId,data])=>[
      chapterId,
      {
        ordersServed:data.ordersServed,
        theoreticalEnergy:data.theoreticalEnergy,
        totalXp:data.totalXp,
        level:data.level,
        sources:data.sources,
        grossCoins:data.grossCoins,
        coinsAfterFullStorage:data.coinsAfterFullStorage,
        chapterDelta:data.chapterDelta,
      },
    ])),
    totals:snapshot.journey.totals,
  },
};
const failures=economyGuardFailures(snapshot);
console.log(JSON.stringify({...report,failures},null,2));
if(failures.length)process.exitCode=1;

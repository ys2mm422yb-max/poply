import { placePowerForUpgrade } from './aaa-place-powers.js';

const COAST_PROGRESS_BENEFITS=Object.freeze({
  seating:Object.freeze({kind:'orders',label:'Neue Küstenaufträge',detail:'Aufträge bis Tier 5'}),
  terrace:Object.freeze({kind:'orders',label:'Premium-Service',detail:'Aufträge bis Tier 6'}),
  sign:Object.freeze({kind:'place',label:'Sonnenkai + Tropenbar',detail:'Neuer Place + Sonnenfrüchte'}),
});

export function placeUpgradeBenefit(upgrade){
  if(!upgrade)return null;
  const power=placePowerForUpgrade(upgrade.id);
  if(power)return {kind:'power',label:power.label,detail:power.short,upgradeId:upgrade.id};
  const coast=COAST_PROGRESS_BENEFITS[upgrade.id];
  if(coast)return {...coast,upgradeId:upgrade.id};
  if(upgrade.unlock)return {kind:'unlock',label:upgrade.unlock,detail:upgrade.copy,upgradeId:upgrade.id};
  return {kind:'visual',label:'Sichtbarer Ausbau',detail:upgrade.copy,upgradeId:upgrade.id};
}

export function placeUpgradeBenefitText(upgrade){
  const benefit=placeUpgradeBenefit(upgrade);
  return benefit?`${benefit.label} · ${benefit.detail}`:'';
}

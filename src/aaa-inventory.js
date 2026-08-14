export const INITIAL_STORAGE_CAPACITY=4;
export const STORAGE_CAPACITY_STEP=2;
export const STORAGE_MAX_CAPACITY=8;
export const STORAGE_UPGRADE_COSTS={4:200,6:450};

export function ensureInventoryState(state){
  const current=Array.isArray(state?.storage)?state.storage.filter(item=>item?.kind==='item'):[];
  const requested=Number.isInteger(state?.storageCapacity)?state.storageCapacity:INITIAL_STORAGE_CAPACITY;
  const capacity=Math.max(INITIAL_STORAGE_CAPACITY,requested,current.length);
  const valid=Array.isArray(state?.storage)&&state.storage.length===current.length&&state.storageCapacity===capacity;
  if(valid)return {state,changed:false};
  const next=structuredClone(state);next.storage=current;next.storageCapacity=capacity;
  return {state:next,changed:true};
}

export function storageUpgradeCost(state){
  const current=ensureInventoryState(state).state.storageCapacity;
  return current>=STORAGE_MAX_CAPACITY?null:STORAGE_UPGRADE_COSTS[current]??null;
}

export function storeBoardItem(inputState,boardIndex){
  const ensured=ensureInventoryState(inputState).state;
  if(!Number.isInteger(boardIndex)||boardIndex<0||boardIndex>=ensured.board.length)return {state:inputState,changed:false,reason:'invalid-source'};
  const item=ensured.board[boardIndex];
  if(!item)return {state:inputState,changed:false,reason:'empty-source'};
  if(item.kind!=='item')return {state:inputState,changed:false,reason:'generator-not-storable'};
  if(ensured.storage.length>=ensured.storageCapacity)return {state:inputState,changed:false,reason:'storage-full'};
  const state=structuredClone(ensured),stored=state.board[boardIndex];
  state.board[boardIndex]=null;state.storage.push(stored);state.updatedAt=Date.now();
  return {state,changed:true,reason:null,item:stored,boardIndex,storageIndex:state.storage.length-1};
}

export function restoreStoredItem(inputState,storageIndex,targetIndex=null){
  const ensured=ensureInventoryState(inputState).state;
  if(!Number.isInteger(storageIndex)||storageIndex<0||storageIndex>=ensured.storage.length)return {state:inputState,changed:false,reason:'invalid-storage-item'};
  let target=targetIndex;
  if(target==null)target=ensured.board.findIndex(slot=>slot===null);
  if(!Number.isInteger(target)||target<0||target>=ensured.board.length)return {state:inputState,changed:false,reason:'board-full'};
  if(ensured.board[target]!==null)return {state:inputState,changed:false,reason:'target-occupied'};
  const state=structuredClone(ensured),item=state.storage[storageIndex];
  state.storage.splice(storageIndex,1);state.board[target]=item;state.updatedAt=Date.now();
  return {state,changed:true,reason:null,item,targetIndex:target};
}

export function upgradeStorage(inputState){
  const ensured=ensureInventoryState(inputState).state,cost=storageUpgradeCost(ensured);
  if(cost===null)return {state:inputState,changed:false,reason:'max-capacity'};
  if((Number(ensured.coins)||0)<cost)return {state:inputState,changed:false,reason:'not-enough-coins',cost};
  const state=structuredClone(ensured);state.coins-=cost;state.storageCapacity+=STORAGE_CAPACITY_STEP;state.updatedAt=Date.now();
  return {state,changed:true,reason:null,cost,capacity:state.storageCapacity};
}

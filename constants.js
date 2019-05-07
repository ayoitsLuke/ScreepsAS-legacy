// General energy-per-tick (EPT) goal to aim for
global.SOURCE_GOAL_OWNED = SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME;
global.SOURCE_GOAL_NEUTRAL = SOURCE_ENERGY_NEUTRAL_CAPACITY / ENERGY_REGEN_TIME;
global.SOURCE_GOAL_KEEPER = SOURCE_ENERGY_KEEPER_CAPACITY / ENERGY_REGEN_TIME;
// Optimal number of parts per source (but 1 to 3 more can lower cpu at a minor increase in creep cost)
global.SOURCE_HARVEST_PARTS = SOURCE_ENERGY_CAPACITY / HARVEST_POWER / ENERGY_REGEN_TIME;
global.SOURCE_HARVEST_PARTS_NEUTRAL = SOURCE_ENERGY_NEUTRAL_CAPACITY / HARVEST_POWER / ENERGY_REGEN_TIME;
global.SOURCE_HARVEST_PARTS_KEEPER = SOURCE_ENERGY_KEEPER_CAPACITY / HARVEST_POWER / ENERGY_REGEN_TIME;
//
global.TASK2SAY = {
  build: "🚧",
  explore: "🌏",
  harvest: "⛏",
  pickup: "🚚",
  recharge: "⚡",
  recycle: "🗑",
  refill: "📥",
  renew: "🔄",
  repair: "🛠",
  upgrade: "⏫"
}
// Creep Task to Action
global.CREEP_TASK2ACTION = {
  build: "build",
  harvest: "harvest",
  pickup: "pickup",
  recharge: "withdraw",
  recycle: "recycleCreep",
  refill: "transfer",
  renew: "renewCreep",
  repair: "repair",
  upgrade: "upgradeController"
};
// Range for creeps action
global.CREEP_ACTION_RANGE = {
  attack: 1,
  attackController: 1,
  build: 3,
  claimController: 1,
  dismantle: 1,
  generateSafeMode: 1,
  harvest: 1,
  heal: 1,
  pickup: 1,
  pull: 1,
  rangedAttack: 3,
  rangedHeal: 3,
  rangedMassAttack: 3,
  repair: 3,
  reserveController: 1,
  signController: 1,
  transfer: 1,
  upgradeController: 3,
  withdraw: 1,
};
// Timers
global.TIMER = {
  gc: 10,
  defconDowngrade: 20,
  productivity: 150,
  scanRoom: 10
};
/**
 * The energy needed for spawning the given body
 *
 * @global
 * @method CREEP_PARTS_COST
 * @param  {Array.<string>} body An array describing creep’s body
 * @see https://docs.screeps.com/api/#StructureSpawn.spawnCreep
 */
global.CREEP_PARTS_COST = (body) => _.sum(body, p => BODYPART_COST[p.type || p]);
/**
 * The build time of the given creep body
 *
 * @global
 * @method CREEP_PARTS_COST
 * @param  {Array.<string>} body An array describing creep’s body
 * @see https://docs.screeps.com/api/#StructureSpawn.spawnCreep
 */
global.CREEP_SPAWN_TIME = (creep) => CREEP_SPAWN_TIME * (creep.length || creep.body.length);

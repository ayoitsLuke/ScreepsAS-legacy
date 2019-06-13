"use strict";
global.MY_USERNAME = _.find(Game.rooms, r => r.controller && r.controller.my)
  .controller.owner.username;
// General energy-per-tick (EPT) goal to aim for
global.SOURCE_GOAL_OWNED = SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME;
global.SOURCE_GOAL_NEUTRAL = SOURCE_ENERGY_NEUTRAL_CAPACITY / ENERGY_REGEN_TIME;
global.SOURCE_GOAL_KEEPER = SOURCE_ENERGY_KEEPER_CAPACITY / ENERGY_REGEN_TIME;
// Optimal number of parts per source (but 1 to 3 more can lower cpu at a minor increase in creep cost)
global.SOURCE_HARVEST_PARTS = SOURCE_ENERGY_CAPACITY / HARVEST_POWER / ENERGY_REGEN_TIME;
global.SOURCE_HARVEST_PARTS_NEUTRAL = SOURCE_ENERGY_NEUTRAL_CAPACITY / HARVEST_POWER / ENERGY_REGEN_TIME;
global.SOURCE_HARVEST_PARTS_KEEPER = SOURCE_ENERGY_KEEPER_CAPACITY / HARVEST_POWER / ENERGY_REGEN_TIME;
// Timers
global.TIMER = {
  gc: 10,
  defconDowngrade: 30,
  productivity: 150,
  scan: 10,
  init: 15e5
};
//
global.STRUCTURE_FULL_THRESHOLD = 0.9;
global.STRUCTURE_EMPTY_THRESHOLD = 1 - global.STRUCTURE_FULL_THRESHOLD;
//
global.CREEP_TASK2SAY = {
  build: "\u{1F6A7}",
  explore: "\u{1F30F}",
  harvest: "\u{26CF}",
  pickup: "\u{1F69A}",
  recharge: "\u{26A1}",
  recycle: "\u{267B}",
  refill: "\u{1F4E5}",
  renew: "\u{1F195}",
  repair: "\u{1F6E0}",
  upgrade: "\u{23EB}"
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
  drop: 0,
  generateSafeMode: 1,
  harvest: 1,
  heal: 1,
  moveTo: 0,
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
  boostCreep: 1,
  recycleCreep: 1,
  renewCreep: 1
};
/**
 * enthalpy: final energy level - initial energy level
 * @exception harvest is negative because it does not return ERR_FULL
 */
global.CREEP_ACTION = { // TODO need an action to part
  attack: {
    range: 1,
    enthalpy: 0,
    part: ATTACK,
  },
  attackController: {
    range: 1,
    enthalpy: 0,
    part: CLAIM,
  },
  build: {
    range: 3,
    enthalpy: -BUILD_POWER,
    part: WORK,
  },
  claimController: {
    range: 1,
    enthalpy: 0,
    part: CLAIM,
  },
  dismantle: {
    range: 1,
    enthalpy: DISMANTLE_POWER * DISMANTLE_COST, // TODO check the math
    part: WORK,
  },
  drop: {
    range: 0,
    enthalpy: -1,
    part: CARRY,
  },
  generateSafeMode: {
    range: 1,
    enthalpy: 0,
    part: CARRY,
  },
  harvest: {
    range: 1,
    enthalpy: -HARVEST_POWER,
    part: WORK,
  },
  heal: {
    range: 1,
    enthalpy: 0,
    part: HEAL,
  },
  moveTo: {
    range: 0,
    enthalpy: 0,
    part: MOVE,
  },
  pickup: {
    range: 1,
    enthalpy: 1,
    part: CARRY,
  },
  pull: {
    range: 1,
    enthalpy: 0,
    part: MOVE,
  },
  rangedAttack: {
    range: 3,
    enthalpy: 0,
    part: RANGED_ATTACK,
  },
  rangedHeal: {
    range: 3,
    enthalpy: 0,
    part: HEAL,
  },
  rangedMassAttack: {
    range: 3,
    enthalpy: 0,
    part: RANGED_ATTACK,
  },
  repair: {
    range: 3,
    enthalpy: -REPAIR_POWER * REPAIR_COST,
    part: WORK,
  },
  reserveController: {
    range: 1,
    enthalpy: 0,
    part: CLAIM,
  },
  signController: {
    range: 1,
    enthalpy: 0,
    part: /\w+/,
  },
  transfer: {
    range: 1,
    enthalpy: -1,
    part: CARRY,
  },
  upgradeController: {
    range: 3,
    enthalpy: -UPGRADE_CONTROLLER_POWER,
    part: WORK,
  },
  withdraw: {
    range: 1,
    enthalpy: 1,
    part: CARRY,
  },
  boostCreep: {
    range: 1,
    enthalpy: 0,
    part: /\w+/,
  },
  recycleCreep: {
    range: 1,
    enthalpy: 0,
    part: /\w+/,
  },
  renewCreep: {
    range: 1,
    enthalpy: 0,
    part: /\w+/,
  },
};
/**
 * The energy needed for spawning the given body
 * @deprecated
 * @global
 * @method CREEP_PARTS_COST
 * @param  {string[]} body An array describing creep's body
 * @see https://docs.screeps.com/api/#StructureSpawn.spawnCreep
 */
global.CREEP_PARTS_COST = (body) => _.sum(body, p => BODYPART_COST[p.part || p]);
/**
 * The build time of the given creep body
 *
 * @global
 * @method CREEP_PARTS_COST
 * @param  {string[]} body An array describing creep's body
 * @see https://docs.screeps.com/api/#StructureSpawn.spawnCreep
 */
global.CREEP_SPAWN_TIME = (creep) => CREEP_SPAWN_TIME * (creep.length || creep.body.length);

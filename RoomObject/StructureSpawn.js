"use strict";
/**
Check spawnQueue and spawn creeps

*/
StructureSpawn.prototype.work = function() {
  if (this.spawning) {
    this.room.visual.text('🐣' + this.spawning.name, this.pos.x + 1, this.pos.y, {
      align: 'left',
      opacity: 0.5
    });
    // if ( this.spawning.remainingTime<=1)this.memory.;
    return;
  } else {};
  // Check room's combat level & decide whether to spawn worker class or military class creeps
  if (this.room.memory.defcon < 4) {
    this.spawnArmy();
  } else {
    this.spawnCivilian();
  }
};
/**
 */
StructureSpawn.prototype.spawnArmy = function() {
  console.log("[stub] StructureSpawn.prototype.spawnArmy")
  this.spawnCivilian();
}
/**
Check spawnQueue and spawn creeps

*/
StructureSpawn.prototype.spawnCivilian = function() {
  const queue = this.room.memory.spawnQueue ? this.room.memory.spawnQueue : this.room.memory.spawnQueue = [];
  // pre-Spawn check
  if (!queue.length) {
    this.room.memory.preSpawn = false;
  } else {
    this.room.memory.preSpawn = true;
    // NOTE: Room.memory.spawnQueue is an Object[]. eg. [{role: "role", target: {some target}}, {}, {}]
    const seed = queue[0];
    // Special case: all creeps die out. Therefore max energy = 300, which < room.energyCapacityAvailable
    seed.urgent = seed.urgent || ((seed.role === "staticHarvester" || seed.role === "scavenger") ? !this.room.find(FIND_MY_CREEPS, {
      filter: c => c.memory.role === seed.role
    }).length : false);
    const body = this.getBodyFor(seed.role, seed.urgent);
    if (!body.length && !seed.urgent) {
      this.room.memory.spawnQueue.shift();
      console.log("[" + this.name + "] skipped " + seed.role);
      return;
    }
    const name = seed.role + Game.shard.name.replace("shard", "\n") + this.room.name + this.name.replace("Spawn", " ") + Game.time % 10000;
    const memory = Object.assign(seed, {
      home: this.room.name
    });
    console.log("[" + this.name + "] is spawning: " + seed.role + (seed.urgent ? " (urgent)" : ""));
    if (OK === this.spawnCreep(body, name, { // PROBLEMATIC: 2 spawn
        memory,
        energyStructures: this.room.find(FIND_MY_STRUCTURES, {
          filter: s => s.structureType === STRUCTURE_EXTENSION && s.isActive(),
          cache: "deep"
        }).concat(this.room.find(FIND_MY_STRUCTURES, {
          filter: s => s.structureType === STRUCTURE_SPAWN && s.isActive(),
          cache: "deep"
        }))
      })) {
      if (!seed.urgent) {
        this.room.find(FIND_MY_CREEPS, {
          filter: c => c.memory.role === seed.role && c.memory.urgent
        }).forEach(c => {
          c.memory.task = "recycle";
          c.memory.target = undefined;
        });
      }
      // RENAME!
      this.room.refillSpeed;
      this.room.refillSpeed(this.room.energyAvailable - body.reduce((totalCost, p) => totalCost + BODYPART_COST[p.type], 0), Game.time + 1)
      this.room.memory.spawnQueue.shift();
      this.room.memory.preSpawn = false;
    }
  }
}
/**

@param {string} role The role of the spawning creep
@param {boolean} urgent
Return body parts based on, if set true, energy currently stored, otherwise max capacity

@return {Array.<string>} An array of body part constants
*/
StructureSpawn.prototype.getBodyFor = function(role, urgent) {
  //user BODYPART_COST
  let budget = urgent ? this.room.energyAvailable > SPAWN_ENERGY_CAPACITY ? this.room.energyAvailable : SPAWN_ENERGY_CAPACITY : this.room.energyCapacityAvailable;
  let base = [CARRY, WORK, MOVE]; // 200 energy
  let dlc = [];
  switch (role) {
    case "miner":
      if (budget > 600) budget = 600;
      dlc = [WORK];
      break;
    case "stationaryWorker": // harvester, high RCL upgrader (RCL >= 5)
      dlc = [WORK, WORK, MOVE]; // 250 energy
      break;
    case "mobileWorker": // repairer, builder, low RCL upgrader
      dlc = [CARRY, CARRY, WORK, WORK, MOVE]; // 350 energy
      break;
    case "carrier": //
      dlc = [CARRY, CARRY, MOVE]; // 200 energy
      break;
      // High RCL creep
    case "hauler": // find creep need help (creep.memory.haulRequested) & pull it
      base = dlc = [MOVE];
      break;
    case "reserver":
      dlc = [CLAIM, MOVE]; // 650 energy
      break;
      // legacy
      //
    case "pioneer":
      base = [CARRY, WORK, MOVE];
      dlc = [CARRY, WORK, MOVE];
      break;
    case "staticHarvester":
      if (budget > 2000) budget = 2000;
      // harvest & drop it to the floor
      base = [CARRY, WORK, MOVE];
      dlc = [WORK, MOVE];
      break;
    case "scavenger":
      // pick up dropped resources
      base = [CARRY, WORK, MOVE, MOVE];
      dlc = [CARRY, CARRY, MOVE];
      break;
    case "remoteHarvester":
      // build a container under then harvest. THINK FOR THE BEST COMBINATION
      base = [CARRY, WORK, MOVE];
      dlc = [CARRY, WORK, MOVE];
      break;
    case "builder": //Supple energy by other ways? Let Hauler pull?
      base = [WORK, CARRY, MOVE];
      dlc = [WORK, CARRY, MOVE];
      break;
    case "repairer":
      base = [WORK, CARRY, MOVE, MOVE];
      dlc = [CARRY, CARRY, WORK, WORK, MOVE];
      break;
    case "upgrader":
      base = [CARRY, WORK, MOVE];
      if (this.room.find(FIND_MY_STRUCTURES, {
          filter: s => s.structureType === STRUCTURE_LINK && s.belonging === "controller"
        }).length) {
        dlc = [WORK, WORK, MOVE];
      } else {
        dlc = [CARRY, CARRY, WORK, WORK, MOVE];
      }
      break;
    case "explorer": // claim body part
      base = [CLAIM, MOVE]
      dlc = [CLAIM, MOVE]
      break;
      //
      //
    case "reserver":
      base = [CLAIM, MOVE];
      dlc = [CLAIM, CLAIM, MOVE];
      break;
    case "guard":
      base = [RANGED_ATTACK, MOVE]
      dlc = [TOUGH, TOUGH, ATTACK, MOVE]
      // 1 MOVE; TOUGH & ATTACK
      break;
    case "shield":
      break;
    case "flanker":
      // ATTCAK+TOUGH = MOVE
      break;
    case "kiter":
      //RANGED_ATTACK = MOVE
      break;
    case "healer":
      break;
    case "wallBreaker":
      base = [WORK, MOVE]
      dlc = [WORK]
      //
      break;
    case "scout":
      if (budget > 1000) budget = 1000;
      base = dlc = [MOVE];
      break;
    default:
      break;
      //return [CARRY, WORK, MOVE]);
  }
  return this.getBodyParts(budget, base, dlc)
};
/**

* @param {number} budget The energy
* @param {Array.<number>} base
* @param {Array.<number>} dlc

* @return {Array.<string>} An array of body part constants
*/
StructureSpawn.prototype.getBodyParts = function(budget, base, dlc) {
  /*
  global.UNIT_COST = (body) => _.sum(body, p => BODYPART_COST[p.type || p]);
  global.UNIT_BUILD_TIME = (body) => CREEP_SPAWN_TIME * body.length;
  */
  let dlcParts = [];
  const baseCost = base.reduce((totalCost, p) => totalCost + BODYPART_COST[p.type], 0)
  const dlcCost = dlc.reduce((totalCost, p) => totalCost + BODYPART_COST[p.type], 0)
  if (baseCost > budget) return [];
  //console.log("base=" + base + " dlc=" + dlc)
  //console.log("budget=" + budget + " baseCost=" + baseCost + " dlcCost=" + dlcCost);
  let dlcCount = (budget - baseCost) / dlcCost;
  dlcCount = dlcCount < 0 ? 0 : (dlcCount * dlc.length > MAX_CREEP_SIZE - base.length) ? ~~((MAX_CREEP_SIZE - base.length) / dlc.length) : ~~dlcCount;
  //console.log(dlcCount);
  while (dlcCount--) {
    dlcParts.push(...dlc);
  }
  return dlcParts.sort(p => p === "tough" || p === "carry" || p === "work" ? -1 : 0); // Move all TOUGH to front
  /*
  var first = {};
  var order = [TOUGH, WORK, CARRY, RANGED_ATTACK, ATTACK, CLAIM, MOVE, HEAL];
  return _.sortBy(body, part => {
      if (part !== TOUGH && first[part] === undefined) {
          first[part] = false;
          return 1000 - order.indexOf(part) * -1; // Arbritarly large number.
      } else {
          return order.indexOf(part);
      }
  });
  */
}

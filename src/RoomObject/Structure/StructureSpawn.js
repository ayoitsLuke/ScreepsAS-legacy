"use strict";
/**
 * Check spawnQueue and spawn creeps
 *
 * @method
 * @return {[type]} [description]
 */
StructureSpawn.prototype.work = function() {
  if (this.spawning) {
    this.room.visual.text("\u{1F423}" + this.spawning.name.substring(0, this.spawning.name.indexOf(/\s/)), this.pos.x + 1, this.pos.y, {
      align: 'left',
      opacity: 0.5
    });
    return;
  }
  if (this.room.memory.defcon < 4) this.room.memory.spawnQueue = [];
  // pre-Spawn check
  if (!this.room.memory.spawnQueue.length) {
    this.room.memory.preSpawn = false;
  } else {
    this.room.memory.preSpawn = true;
    // NOTE: Room.memory.spawnQueue is an Object[]. eg. [{role: "role", target: {some target}}, {}, {}]
    const seed = this.room.memory.spawnQueue[0];
    // Special case: all creeps die out. Therefore max energy = 300, which < room.energyCapacityAvailable
    const body = this.getBodyFor(seed.role, seed.urgent);
    if (!body.length && !seed.urgent) {
      this.room.memory.spawnQueue.shift();
      console.log("[" + this.name + "] skipped " + seed.role);
      return;
    }
    const name = seed.role + Game.shard.name.replace("shard", "\n") + this.room.name + this.name.replace("Spawn", " ") + Game.time % 10000;
    const memory = {
      ...seed,
      home: this.room.name
    };
    const energyStructures = [...this.room.find(FIND_MY_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_EXTENSION && s.isActive()
    }), ...this.room.find(FIND_MY_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_SPAWN && s.isActive()
    })];
    console.log("[" + this.name + "] is spawning: " + seed.role + (seed.urgent ? " (urgent)" : ""));
    const spawnCreepErrMsg = this.spawnCreep(body, name, {
      energyStructures,
      memory,
    });
    if (spawnCreepErrMsg === OK) {
      if (!seed.urgent) {
        this.room.find(FIND_MY_CREEPS, {
            filter: c => c.memory.role === seed.role && c.memory.urgent
          })
          .forEach(c => {
            c.memory.task = "recycle";
            c.memory.target = undefined;
          });
      }
      // TODO rename!
      this.room.refillSpeed;
      this.room.refillSpeed(this.room.energyAvailable - body.reduce((totalCost, p) => totalCost + BODYPART_COST[p.type], 0), Game.time + 1)
      this.room.memory.spawnQueue.shift();
      this.room.memory.preSpawn = false;
    }
  }
}
/**
 * [description]
 *
 * @method
 * @param  {string} type The type of the spawining creep
 * @param  {boolean} [urgent=false] Return body parts based on, if true, energy currently stored, otherwise max capacity
 * @return {string[]} An array describing the new creepâ??s body
 */
StructureSpawn.prototype.getBodyFor = function(type, urgent) {
  //use BODYPART_COST
  let budget = urgent ? this.room.energyAvailable > SPAWN_ENERGY_CAPACITY ? this.room.energyAvailable : SPAWN_ENERGY_CAPACITY : this.room.energyCapacityAvailable;
  let base = [CARRY, CARRY, WORK, MOVE, MOVE]; // 300 energy
  let dlc = [];
  switch (type) {
    // Civilian
    case "Worker_s_lc": // Worker(stationary, low capacity)
      dlc = [WORK];
      break;
    case "Worker_s_hc": // Worker(stationary, high capacity)
      dlc = [CARRY, WORK];
      break;
    case "Worker_m_lc": // Worker(mobile, low capacity)
      // harvester, high RCL upgrader (RCL >= 5)
      dlc = [WORK, WORK, MOVE]; // 250 energy
      break;
    case "Worker_m_hc": // Worker(mobile, high capacity)
      // repairer, builder, low RCL upgrader
      dlc = [CARRY, CARRY, WORK, WORK, MOVE]; // 350 energy
      break;
    case "Transporter":
      dlc = [CARRY, CARRY, MOVE]; // 150 energy
      break;
      // High RCL creep
    case "Creep_of_Science":
      dlc = [CARRY];
      break;
    case "Hauler": // find creep need help (creep.memory.haulRequested) & pull
      base = dlc = [MOVE];
      break;
    case "Reserver":
      base = dlc = [CLAIM, MOVE]; // 650 energy
      break;
      // Military
    case "Rifleman":
      base = [RANGED_ATTACK, MOVE]; // 200 energy
      dlc = [TOUGH, ATTACK, MOVE, MOVE]; // 190 energy
      break;
    case "Medic":
      base = [RANGED_ATTACK, MOVE]; // 200 energy
      dlc = [HEAL, MOVE]; // 300 energy
      break;
      // Specialist
    case "Sniper":
      base = dlc = [RANGED_ATTACK, MOVE]; // 200 energy
      break;
    case "Shield": // Need hauler
      base = [MOVE, MOVE];
      dlc = [TOUGH, HEAL];
      break;
    case "Combat_Engineer":
      base = [RANGED_ATTACK, MOVE]; // 200 energy
      dlc = [WORK, MOVE]; // 210 energy
      break;
    default:
      break;
  }
  return this.getBodyParts(budget, base, dlc)
};
/**
 *
 *
 * @method
 * @param {number} budget The upper energy limit to spend of this creep
 * @param {string[]} base
 * @param {string[]} dlc
 * @return {string[]} An array of all body part based on the given parts
 */
StructureSpawn.prototype.getBodyParts = function(budget, base, dlc) {
  let parts = [];
  const baseCost = CREEP_PARTS_COST(base);
  const dlcCost = CREEP_PARTS_COST(dlc);
  if (baseCost > budget) return [];
  //console.log("base=" + base + " dlc=" + dlc)
  //console.log("budget=" + budget + " baseCost=" + baseCost + " dlcCost=" + dlcCost);
  let dlcCount = (budget - baseCost) / dlcCost;
  dlcCount = ((dlcCount * dlc.length) > (MAX_CREEP_SIZE - base.length)) ? ~~((MAX_CREEP_SIZE - base.length) / dlc.length) : ~~dlcCount;
  //console.log(dlcCount);
  while (dlcCount--) {
    parts.push(...dlc);
  }
  parts.push(...base);
  return parts.sort(p => p === "tough" || p === "carry" || p === "work" ? -1 : 0);
  /* sort by order
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

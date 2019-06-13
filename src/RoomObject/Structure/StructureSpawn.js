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
    // NOTE: Room.memory.spawnQueue is an Object[]. eg. [{type: "type", target: {some target}}, {}, {}]
    const egg = this.room.memory.spawnQueue[0];
    const body = this.getBodyFor(egg.type, egg.urgent);
    if (!body.length && !egg.urgent) {
      this.room.memory.spawnQueue.shift();
      console.log("[" + this.name + "] skipped " + egg.type);
      return;
    }
    const name = egg.type + Game.shard.name.replace("shard", "\n") + this.room.name + this.name.replace("Spawn", " ") + Game.time % 10000;
    const memory = {
      ...egg,
      home: this.room.name
    };
    const energyStructures = [...this.room.find(FIND_MY_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_EXTENSION && s.isActive()
    }), ...this.room.find(FIND_MY_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_SPAWN && s.isActive()
    })];
    console.log("[" + this.name + "] is spawning: " + egg.type + (egg.urgent ? " (urgent)" : ""));
    const errMsg = this.spawnCreep(body, name, {
      energyStructures,
      memory,
    });
    if (errMsg === OK) {
      // this.room.refillSpeed;
      // this.room.refillSpeed(this.room.energyAvailable - body.reduce((totalCost, p) => totalCost + BODYPART_COST[p.type], 0), Game.time + 1)
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
  const [base, dlc] = this.getPartsFrom(type);
  return this.getBodyParts(budget, base, dlc)
};
/**
 * Generate a list of basic components of a creep from its type
 * @param   {string}  type  the type name of a creep
 * @return  {string[]}  [base, dlc]
 */
StructureSpawn.prototype.getPartsFrom = (type) => {
  let base = [CARRY, WORK, MOVE, MOVE]; // 250 energy
  switch (type) {
    // TODO see if each dlc is reasonable
    // Civilian
    case "Constructor_s_lc": // Constructor (stationary, low capacity)
      dlc = [WORK];
      break;
    case "Constructor_s_hc": // Constructor (stationary, high capacity)
      dlc = [CARRY, CARRY, WORK, WORK, WORK];
      break;
    case "Constructor_m_lc": // Constructor (mobile, low capacity)
      // harvester, high RCL upgrader (RCL >= 5)
      dlc = [WORK, WORK, MOVE]; // 250 energy
      break;
    case "Constructor_m_hc": // Constructor (mobile, high capacity)
      // repairer, builder, low RCL upgrader
      dlc = [CARRY, CARRY, WORK, WORK, MOVE]; // 350 energy
      break;
    case "Logistician":
      dlc = [CARRY, CARRY, MOVE]; // 150 energy
      break;
      // High RCL creep
    case "Creep_of_Science":
      dlc = [CARRY];
      break;
    case "Defender":
      dlc = [ATTACK, RANGED_ATTACK, MOVE];
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
      dlc = [ATTACK, MOVE]; // 190 energy
      break;
    case "Medic":
      base = [RANGED_ATTACK, MOVE]; // 200 energy
      dlc = [HEAL, MOVE]; // 300 energy
      break;
      // Specialist
    case "Distractor": // ! Need hauler
      base = [RANGED_ATTACK, MOVE];
      dlc = [TOUGH, HEAL];
      break;
    case "Combat_Engineer":
      base = [RANGED_ATTACK, MOVE]; // 200 energy
      dlc = [WORK, MOVE]; // 210 energy
      break;
    default:
      break;
  }
  return [base, dlc];
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
  const baseCost = _.sum(base, p => BODYPART_COST[p.part || p]);
  const dlcCost = _.sum(dlc, p => BODYPART_COST[p.part || p]);
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

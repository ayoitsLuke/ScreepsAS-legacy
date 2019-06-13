"use strict";
Room.prototype.setSpawnQueue = function() {
  if (!this.find(FIND_MY_SPAWNS)
    .length) return;
  if (!this.memory.spawnQueue) this.memory.spawnQueue = [];
  // Spawn military
  if (this.memory.defcon < 4) {
    this.memory.spawnQueue.unshit(...fireTeam());
  }
  // const creepsInRoom = _.groupBy(this.find(FIND_MY_CREEPS), "memory.role");
  const creepsByRole = _.groupBy(Object.values(Game.creeps)
    .filter(c => c.memory.home === this.name), "memory.type");
  // TODO Reset spawn queue if all creeps died
  if (!creepsByRole["Transporter"]) this.memory.spawnQueue = [];
  // TODO Normal spawns
  if (!this.memory.spawnQueue.length) {
    Object.keys(_.groupBy(this.memory.task, "creepType"))
      .forEach(key => this.memory.spawnQueue.push({
        type: key
      }));

    /*
    const sourcesCount = this.find(FIND_SOURCES)
      .length;
    // Scavenger
    const carryPartsNeeded = _.sum(this.find(FIND_DROPPED_RESOURCES), r => ~~(r.amount / 50)); // how many CARRY part needed to pick up all drpped resource
    const maxCarryEachCreep = this.find(FIND_MY_SPAWNS, {
        cache: "deep"
      })[0].getBodyFor("scavenger", false)
      .reduce((carryCount, p) => carryCount + (p === CARRY), 0); //the max amount of CARRY one scavenger can have.
    let scavengerNeeded = ~~(carryPartsNeeded / maxCarryEachCreep);
    if (scavengerNeeded > 2 * sourcesCount) scavengerNeeded = 2 * sourcesCount + 1;
    // Harvester
    let workCount = 0;
    if (creepsByRole["staticHarvester"]) creepsByRole["staticHarvester"].forEach(c => workCount += c.getActiveBodyparts(WORK));
    const totalWorkParts = creepsByRole["staticHarvester"] ? creepsByRole["staticHarvester"].reduce((carryCount, c) => carryCount + c.getActiveBodyparts(WORK), 0) : 0;

    // Upgrader

    // Builder

    // Repairer
*/
  }
};

/**
 * A standard fireteam (2 rifleman, 2 medic) and one extra role
 *
 * @param   {string}  role
 * @return  {Object[]}
 */
function fireTeam(role) {
  let draft = role ? [{
    role
  }] : [];
  draft.push({
    role: "Rifleman"
  }, {
    role: "Medic"
  }, {
    role: "Rifleman"
  }, {
    role: "Medic"
  });
  return draft;
}
/**
 * 2 fireTeam w / shield total of 10 creeps
 *
 * @param {Object[]} number
 * @return {Object[]}
 */
function squad(number) {
  return [...fireTeam("shield"), ...fireTeam("shield")]
}
/**
 * TODO
 * 1 full squad + combat engineer.
 *
 * @param   {[type]}  number  [number description]
 * @return  {[type]}          [return description]
 */
function platoon(number) { // 1 full squad + combat engineer.

  this.memory.spawnQueue = [];
}

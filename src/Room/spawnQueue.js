"use strict";
Room.prototype.setSpawnQueue = function() {
  if (!this.find(FIND_MY_SPAWNS, {
      cache: "deep"
    })
    .length) return;
  if (!this.memory.spawnQueue) this.memory.spawnQueue = [];
  // Spawn military
  if (this.memory.defcon < 4 && this.memory.spawnQueue[0].type !== "military") {
    // Fire Team
    this.spawnFireTeam(1);
    return;
  }
  // const creepsInRoom = _.groupBy(this.find(FIND_MY_CREEPS), "memory.role");
  const creepsByRole = _.groupBy(Object.values(Game.creeps)
    .filter(c => c.memory.home === this.name), "memory.role");
  // console.log("Spawn queue: " + this.memory.spawnQueue.map(o => o.role));
  // Emergency Spawn if all creeps died
  if (((!creepsByRole["staticHarvester"] || !creepsByRole["scavenger"]) && this.memory.spawnQueue[0] && !this.memory.spawnQueue[0].urgent)) {
    this.memory.spawnQueue = [];
  }
  // Normal spawns
  if (!this.memory.spawnQueue.length) {
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
    if (!creepsByRole["scavenger"] || scavengerNeeded) {
      while (scavengerNeeded--) {
        this.memory.spawnQueue.push({
          role: "scavenger",
          urgent: !creepsByRole["scavenger"]
        });
      }
    }
    // Harvester
    let workCount = 0;
    if (creepsByRole["staticHarvester"]) creepsByRole["staticHarvester"].forEach(c => workCount += c.getActiveBodyparts(WORK));
    const totalWorkParts = creepsByRole["staticHarvester"] ? creepsByRole["staticHarvester"].reduce((carryCount, c) => carryCount + c.getActiveBodyparts(WORK), 0) : 0;
    if (totalWorkParts < 5 * sourcesCount && (creepsByRole["staticHarvester"] ? creepsByRole["staticHarvester"].length : 0) < this.sourceSpace) {
      this.memory.spawnQueue.push({
        role: "staticHarvester",
        urgent: !creepsByRole["staticHarvester"]
      });
      return;
    } else if (this.productivity > 1 && (creepsByRole["remoteHarvester"] ? creepsByRole["remoteHarvester"].length : 0) < 6) {
      this.memory.spawnQueue.push({
        role: "remoteHarvester"
      })
    }
    // Upgrader
    if (!creepsByRole["upgrader"] || (creepsByRole["upgrader"].length < 3 && this.productivity > 1.5)) {
      this.memory.spawnQueue.push({
        role: "upgrader"
      });
    }
    // Builder
    if (this.productivity > 1 && !creepsByRole["builder"] && Object.values(Game.constructionSites)
      .length) {
      this.memory.spawnQueue.push({
        role: "builder"
      });
    }
    // Repairer
    if (!creepsByRole["repairer"]) {
      this.memory.spawnQueue.push({
        role: "repairer"
      });
    }
    if (this.productivity > 1 && Game.gcl.level > this.find(FIND_MY_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_CONTROLLER,
        all: true
      })
      .length
    ) {
      this.memory.spawnQueue.push({
        role: "explorer"
      });
    }
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

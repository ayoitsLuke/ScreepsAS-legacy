"use strict";
Room.prototype.setSpawnQueue = function () {
  if (!this.find(FIND_MY_SPAWNS, {
      cache: "deep"
    })
    .length) return;
  if (!this.memory.spawnQueue) this.memory.spawnQueue = [];
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
          role: "upgrader",
          // urgent: this.controller.ticksToDowngrade < CONTROLLER_DOWNGRADE[this.controller.level] || !creepsByRole["upgrader"]
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
      if (this.productivity > 1 && !creepsByRole["explorer"]
        /*Game.gcl.level > this.find(FIND_MY_STRUCTURES, {
                        filter: s => s.structureType === STRUCTURE_CONTROLLER,
                        all: true
                    }).length*/
      ) {
        this.memory.spawnQueue.push({
          role: "explorer"
        });
      }
      // if (this.productivity > 2) {
      //     this.memory.spawnQueue.push({
      //         role: "scout"
      //     });
      // }
    }
  }
};
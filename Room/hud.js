"use strict";
Room.prototype.hud = function() {
  try {
    // Top Left
    this.visual.text("Room: " + this.name + " \n Spawn queue: " + this.memory.spawnQueue.map(o => o.role), 0, 0, {
      align: "left",
      opacity: 0.5
    });
    this.visual.text("RCL: " + this.controller.level + " \n Progress: " + ~~(100 * this.controller.progress / this.controller.progressTotal) + "%", 0, 1, {
      align: "left",
      opacity: 0.5
    })
    this.visual.text("energy/tick: " + ~~this.productionPerTick + " \n productivity: " + ~~(100 * this.productivity) + "% \n DEFCON: " + this.memory.defcon, 0, 2, {
      align: "left",
      opacity: 0.5,
      color: this.productivity >= 1 ? "#00FF00" : this.productivity >= 0.2 ? "#FFFF00" : "#ff0000"
    });
    // Should remove this to save CPU
    const creepsByRole = _.groupBy(Object.values(Game.creeps).filter(c => c.memory.home === this.name), "memory.role");
    let i = 5;
    for (const creep in creepsByRole) {
      this.visual.text(creep + ": " + creepsByRole[creep].length, 0, i++, {
        align: "left",
        opacity: 0.5
      });
    }
    // Top right
    const allCreepsByRole = _.groupBy(Game.creeps, 'memory.role');
    this.visual.text("-Total creeps count:", 49, 0, {
      align: "right",
      opacity: 0.5
    })
    let j = 1;
    for (const creep in allCreepsByRole) {
      new RoomVisual(this.name).text(creep + ": " + allCreepsByRole[creep].length, 49, j++, {
        align: "right",
        opacity: 0.5
      });
    }
    // On each source
    let sources = this.find(FIND_SOURCES);
    for (const source of sources) {
      this.visual.text(~~source.productionPerTick + " energy/tick " + ~~(100 * source.productivity) + "% ", source.pos, {
        align: "left",
        color: source.productivity > 1 ? "#00FF00" : source.productivity > 0.2 ? "#FFFF00" : "#ff0000",
        opacity: 0.5
      });
    }
  } catch (e) {
    console.log("[HUD]", e)
  }
}

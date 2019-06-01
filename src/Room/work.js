"use strict";
// This doc connect each creep's role to it's action/task
// Note: keep go_* simple and define condition in role to action
// All go_* can recieve a object as param to force
//pass a opts into go_* to get a reuse target ID???
Room.prototype.work = function() {
  /*
  Work flow -> init if need -> scan if needed -> gather task -> assign task to nearest creep
  */
 // TODO move this to main
  if (!this.memory.lastUpdate) this.memory.lastUpdate = {};
  if (!this.memory.lastUpdate.init) {
    // TODO only init once but scan & update more times
    this.memory.lastUpdate.init = Game.time;
    this.init();
  }
  if (!(this.memory.lastUpdate.scan > Game.time - TIMER[scan])) {
    this.memory.lastUpdate.scan = Game.time;
    this.statusQuo();
  }
  if (this.memory.type === "my") {
    this.setSpawnQueue();
  }
  if (this.memory.type !== "hostile") this.generateTask();

  this.hud();
}
/**
 * [gatherTasks description]
 *
 * @return  {[type]}  [return description]
 */
/**
 *
 * Find creep without task, group them by type
 * then look up task for each type in room.memory.task = { }
 * TODO handle when creep do task but still resource left. eg. get energy from container then transfer into one extension, & still have energy left in the creep.
 * Solutions:
 * Or an I/O system,
 * @example {from: {action, target, resource}, {withdraw, container, 10}...}, to: [{transfer, extensions, 20},{},{}]}
 * TODO decide the format for store such info
 * @return  {[type]}  [return description]
 */
Room.prototype.gatherTasks() = function() {
  if (!this.memroy.task) {
    let list = {};
    RESOURCES_ALL.forEach(r => list[r] = []);
    this.memory.task = {
      from: {
        list
      },
      to: {
        list
      }
    };
  }
  _.invoke(this.find(FIND_STRUCTURES), "generateTask") // TODO add "getTask" to each structures
  _.invoke(this.find(FIND_MY_CONSTRUCTION_SITES), "getTask") // TODO
};

/**
 *
 *
 * @return  {[type]}  [return description]
 */
function selfDestruct() {
  if (this.controller && this.controller.my && Game.time % 100 === 1) {
    if (!this.memory.level || this.memory.level < this.controller.level) this.memory.level = this.controller.level;
    if (!this.find(FIND_MY_SPAWNS)
      .length) {
      Memory.BURN = this.name + Game.time;
      this.terminal.destroy();
      this.storage.destroy();
      this.find(FIND_MY_CREEPS)
        .forEach(c => c.say("congrates! U win!"))
    }
  }

}

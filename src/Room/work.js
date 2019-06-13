"use strict";
/**
 * Room.work will be called each tick
 * Work flow: init - > scan - > save a list of task in memory - > setSpawnQueue
 *
 * @param   {Creeps[]}  [creeps]  Creeps belongs to this room
 * @return  {[type]}  [return description]
 */
Room.prototype.work = function(creeps) {
  if (!this.memory.lastUpdate) this.memory.lastUpdate = {};
  if (!(this.memory.lastUpdate.init > Game.time - TIMER[init])) {
    // TODO Init is about the fix structures in the room
    this.memory.lastUpdate.init = Game.time;
    this.init();
  }
  if (!(this.memory.lastUpdate.scan > Game.time - TIMER[scan])) {
    // TODO Scan is about creep info
    this.memory.lastUpdate.scan = Game.time;
    this.scan();
  }
  if (this.type !== "hostile" && Game.map.prototype.getRoomTaxicabDistance(this.name, this.home, name) <= Math.ceil(this.home.rcl / 3)) {
    let currentRoomTasks = this.gatherTasks();
    for (const task in roomTasks) {
      if (!task.creepType) {
        Object.assign(task, {
          creepType: this.taskToCreepType(task)
        });
      }
    }
    this.memory.task.push(...currentRoomTasks);
  }
  if (this.find(FIND_MY_SPAWNS)[0]) {
    this.setSpawnQueue();
    // TODO add creepType in each task;
  }
  this.hud();
}
/**
 * Create a list of tasks by checking each structures & constructure sites {@link src/RoomObject/Structure/structure.js}
 *
 * @example {from: {action, target, resource}, {withdraw, container, 10}...}, to: [{transfer, extensions, 20},{},{}]}
 * @return  {Object[]}  A list of tasks
 */
Room.prototype.gatherTasks() = function() {
  let task = [];
  this.find(FIND_SOURCES_ACTIVE, {
      filter: s => s.pos.findInRange(FIND_MY_CREEPS, 1)
        .reduce((workParts, c) => workParts + c.getActiveBodyparts(WORK), 0) < 5
    })
    .forEach(s => {
      if (this.memory.taskSent) return;
      s.memory.taskSent = true;
      task.push({
        action: "harvest",
        enthalpy: 1,
        target: s.simplify,
        time: Game.time,
      })
    });
  this.find(FIND_STRUCTURES)
    .forEach(s => task.push(...s.generateTask()));
  this.find(FIND_MY_CONSTRUCTION_SITES)
    .forEach(s => task.push(...s.generateTask())); // TODO
  return task;
};

/**
 *
 *
 * @return  {[type]}  [return description]
 */
function selfDestruct() {
  if (!this.find(FIND_MY_SPAWNS)
    .length) {
    Memory.BURN = this.name + Game.time;
    this.terminal.destroy();
    this.storage.destroy();
    this.find(FIND_MY_CREEPS)
      .forEach(c => c.say("congrates! U win!"))
  }
}

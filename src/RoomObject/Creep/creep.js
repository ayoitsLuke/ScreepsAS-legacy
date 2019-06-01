"use strict";
// Room only list task as [withdraw, contianer],[], creep check task
Object.defineProperties(Creep.prototype, {
  type: {
    configurable: true,
    get: function() {
      if (!this.memory.type) {
        this.memory.type = this.name.substring(0, this.name.indexOf("\n"))
      }
      return this.memory.type;
    },
    set: function(value) {
      this.memory.type = value;
    }
  }
});
/**
 * [work description]
 * @var  {Object[]}  this.memory.task  An object array
 * @return  {[type]}  [return description]
 */
Creep.prototype.work = function() {
  if (!this.memory.task) this.memory.task = [];
  // TODO get to task first & then look for same resourceType in task
  // Might need to define
  if (!this.memory.task.length) this.getTask();
  this.doTask();
};
/**
 * Get task from Room
 * TODO get "to" quest first & then "from"
 * If there's no to quest but from, send from to storage or terminals
 *
 * @return  {Object[]}  An object contain action and target
 * @example {action: withdraw, target: {id: "someID", pos: {new RoomPosition()}}}
 */
Creep.prototype.getTask = function() {
  const toTask = this.home.memory.task.to.find(t=>t.action);
   // TODO link task w/ creep type
  const fromTask = this.home.memory.task.from.find;
  (t => t.resource.resourceType === toTask.resource.resourceType)
  this.memory.task = [toTask, fromTask];
};
/**
 * Execute the task in the memory
 *
 * @return  {number}  One of the ERR_* constants
 */
Creep.prototype.doTask = function() {
  const {
    action,
    target,
    resource
  } = this.memory.task[this.memory.task.length - 1];
  const errMsg = this.go_(action, target, resource);
  if (errMsg) { // This deisgn is not game efficientÃ
    target.memory.taskSent = false;
    this.memory.task.pop();
    return OK;
  }
};
/**
 * [description]
 *
 * @param   {string}  action  Any [Creep.action()]{@link https://docs.screeps.com/api/#Creep} method
 * @param   {RoomObject}  target  Can also be any object formatted as {id: {string}, pos: {x: {number}, y:{number}, roomName: {string}}}
 * @param   {Object}  [resource]  Options for Creep.drop().
 * @param   {number}  [resource.resourceType=Object.keys(this.carry)[0]]  When using "withdraw", "transfer", or "drop", use this to specify the resource
 * @param   {number}  [resource.amount]
 * @return  {number}  [description]
 */
Creep.prototype.go_ = function(action, target, resource) {
  const reusePath = 25;
  const range = CREEP_ACTION[action].range;
  const target = RoomObject.active(target);
  resource = resource || {};
  resource.resourceType = resource.resourceType || Object.keys(this.carry)[0];
  // Existence check if visible
  if (this.pos.roomName === target.pos.roomName && !target.room) {
    return ERR_INVALID_TARGET;
  }
  // If not in range, move. If in range, preform action
  if (!this.pos.inRangeToRoomObject(target, range)) {
    return this.moveTo(target.pos, {
      range,
      reusePath,
      visualizePathStyle: {
        stroke: RES_COLORS[_.findLastKey(this.carry)]
      }
    });
  } else {
    if (action.endWith(Creep)) { // renewCreep or recycleCreep
      this.transfer(target, Object.keys(this.carry)[0]);
      return target[action](this);
    } else if (action === "drop") {
      return this[action](resource.resourceType, resource.amount);
    } else {
      const errMsg = this[action](target, resource.resourceType, resource.amount);
      if ((action === "repair" || action === "heal") && target.hits >= target.hitsMax) {
        // Prevent over repairing/healing
        return ERR_FULL;
      } else {
        return errMsg;
      }
    }
  }
};

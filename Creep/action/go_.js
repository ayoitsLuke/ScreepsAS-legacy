"use strict";
/**
 * [description]
 *
 * @method
 * @param  {string} task [description]
 * @param  {Object=} target [description]
 * @param  {boolean=} override [description]
 * @return {[type]} [description]
 */
Creep.prototype.go_ = function(action, target, override) {
  const reusePath = 25;
  const range = CREEP_ACTION_RANGE[method];
  // Check creep's task (exit if creep has other task, & no overriding)
  if (this.memory.task && this.memory.task.action !== action && !override) {
    this.say("tasked")
    return ERR_BUSY;
  }

  // Set & lock target
  if (!this.memory.task && target) {
    this.memory.task = {
      action,
      target: (({
        id,
        pos
      }) => ({
        id,
        pos
      }))(target)
    };
  }
  const targetPos = new RoomPosition(...Object.values(this.memory.task.target.pos));
  // Move closer untill in range
  if (!this.pos.inRangeTo(targetPos, range)) {
    return this.moveTo(targetPos, {
      range,
      reusePath,
      visualizePathStyle: {
        stroke: this.carry.energy ? '#ffaa00' : "#ffffff"
      }
    });
  } else {
    const target = Game.getObjectById(this.memory.task.target.id)
    if (method.endWith(Creep)) {
      this.transfer(target, Object.keys(this.carry)[0]);
      return target[method](this);
    } else {
      return this[method](target, Object.keys(this.carry)[0]);
    }
  }
}

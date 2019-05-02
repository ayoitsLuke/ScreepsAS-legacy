"use strict";
/**
@param {RoomObject=} target RoomObject.id or any Object contains {pos: RoomPosition}
@param {Object=} optsOvrd Same as [opts] for Room.find(). See:
https://docs.screeps.com/api/#Room.find

@return {boolean} False if target cannot be found or action cannot be performed, otherwise true
*/
Creep.prototype.go_ = function(task, target) {
    const reusePath = 20;
    const method = CREEP_TASK2ACTION[task];
    const range = CREEP_ACTION_RANGE[method];
    // Check creep's task (exit if creep has other task, & no overriding)
    if (this.memory.task && this.memory.task !== task) {
        return false;
    }
    // Check RCL
    // Set & lock target
    if (!this.memory.target && target) {
        const id = target.id;
        const pos = target.pos;
        this.memory.task = task;
        this.memory.target = {
            id,
            pos
        };
    }
    // Get roomPosition via memory
    const {
        x,
        y,
        roomName
    } = this.memory.target.pos;
    const targetPos = new RoomPosition(x, y, roomName);
    // Move closer untill in range
    if (!this.pos.inRangeTo(targetPos, range)) {
        this.moveTo(targetPos, {
            range,
            reusePath
        });
    } else {
        const target = Game.getObjectById(this.memory.target.id)
        if (method.endWith(Creep)) {
            this.transfer(target, this.carry.keys[0]);
            target[method](this);
        }
        const errMsg = this[method](target, this.carry.keys[0]);
        switch (errMsg) {
            case OK:
                break;
            case ERR_NOT_ENOUGH_RESOURCES:
            case ERR_INVALID_TARGET:
            case ERR_FULL:
            case ERR_INVALID_ARGS:
                this.memory.task = undefined;
                break;
            default:
                this.say(errMsg, task);
                this.memory.task = undefined;
        }
    }
    if (this.memory.task) return true;
    else return this.memory.target = undefined;
}
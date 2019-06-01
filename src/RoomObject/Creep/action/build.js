"use strict";
/**
@param {RoomObject=} targetOvrd RoomObject.id or any Object contains {pos: RoomPosition}
@param {Object=} optsOvrd Same as [opts] for Room.find(). See: 
https://docs.screeps.com/api/#Room.find

@return {boolean} False if target cannot be found or action cannot be performed, otherwise true
*/
Creep.prototype.go_build = function(targetOvrd, optsOvrd) {
    const reusePath = 10;
    const task = "build";
    const method = "build";
    const range = CREEP_ACTION_RANGE[method];
    // Arguments handling
    if (!optsOvrd) {
        if ((targetOvrd && targetOvrd.pos) || targetOvrd instanceof RoomPosition || Game.getObjectById(targetOvrd) instanceof RoomObject) {
            optsOvrd = {};
            targetOvrd = Game.getObjectById(targetOvrd) || targetOvrd;
        } else {
            optsOvrd = targetOvrd || {};
            targetOvrd = undefined;
        }
    }
    // Check creep's task (exit if creep has other task, & no overriding)
    if (this.memory.task && this.memory.task !== task && !targetOvrd) {
        return false;
    }
    // Set & lock target
    if (!this.memory.target || targetOvrd) {
        let list = [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER, STRUCTURE_LINK, STRUCTURE_STORAGE, STRUCTURE_ROAD, STRUCTURE_CONTAINER];
        const goal = this.pos.findClosestByPriority(FIND_CONSTRUCTION_SITES, Object.assign({
            filter: s => s.my,
            cache: true,
            stict: true
        }, optsOvrd), list) || this.room.find(FIND_CONSTRUCTION_SITES, {
            filter: s => s.my,
            all: true,
            max: s => s && s.progress,
            cache: true
        })[0];
        if (!targetOvrd && !goal) return this.memory.task = undefined;;
        const id = targetOvrd ? targetOvrd.id : goal.id;
        const pos = targetOvrd ? (targetOvrd.pos || targetOvrd) : goal.pos;
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
    if (!this.pos.inRangeTo(targetPos, range)) {
        // Move to target position
        this.moveTo(targetPos, {
            range,
            reusePath
        })
    } else {
        const errMsg = this[method](Game.getObjectById(this.memory.target.id));
        switch (errMsg) {
            case OK:
                // if (BUILD_POWER * this.getActiveBodyparts[WORK] >= this.carry.energy) {
                //     this.memory.task = undefined;
                // }
                break;
            case ERR_NOT_ENOUGH_RESOURCES:
            case ERR_INVALID_TARGET:
            case ERR_INVALID_ARGS:
                this.memory.task = undefined;
                break;
            default:
                this.say(errMsg + task);
                this.memory.task = undefined;
        }
    }
    if (this.memory.task) return true;
    else return this.memory.target = undefined;
}
"use strict";
/**
@param {RoomObject=} targetOvrd RoomObject.id or any Object contains {pos: RoomPosition}
@param {Object=} optsOvrd Same as [opts] for Room.find(). See:
https://docs.screeps.com/api/#Room.find

@return {boolean} False if target cannot be found or action cannot be performed, otherwise true
*/
Creep.prototype.go_refill = function(targetOvrd, optsOvrd) {
    const reusePath = 10;
    const task = "refill";
    const method = "transfer";
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
    // Check RCL
    // Set & lock target
    if (!this.memory.target || targetOvrd) {
        const list = this.room.memory.defcon < 5 ? [STRUCTURE_TOWER] : [STRUCTURE_EXTENSION, Math.random() < 0.7 ? STRUCTURE_SPAWN : STRUCTURE_TOWER];
        let goal = this.memory.home === this.room.name ? this.pos.findClosestByPriority(FIND_MY_STRUCTURES, Object.assign({
            filter: s => s.energy < s.energyCapacity || (s.store && s.store[RESOURCE_ENERGY] < s.storeCapacity),
            claim: true,
            // debug: true,
            byPath: true
        }, optsOvrd), list) : Game.rooms[this.memory.home].find(FIND_MY_STRUCTURES, Object.assign({
            filter: s => (s.energy < s.energyCapacity || (s.store && s.store[RESOURCE_ENERGY] < s.storeCapacity)) && s.belonging !== "source" && s.belonging !== "mineral",
            min: s => s && (s.energy || (s.store && s.store[RESOURCE_ENERGY])),
            claim: true
        }, optsOvrd))[0];
        if (this.carry.energy < _.sum(this.carry)) {
            goal = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: s => s.structureType === STRUCTURE_STORAGE,
                all: true
            })
        }
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
    // Move closer untill in range
    if (!this.pos.inRangeTo(targetPos, range)) {
        this.moveTo(targetPos, {
            range,
            reusePath
        });
    } else {
        const target = Game.getObjectById(this.memory.target.id)
        const errMsg = this[method](target, _.findLastKey(this.carry, r => r > 0));
        switch (errMsg) {
            case OK:
                if (_.sum(this.carry) >= (target.energyCapacity - target.energy) || (target.storeCapacity - _.sum(target.store))) {
                    this.memory.target = undefined;
                }
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
"use strict";
/**
 * [description]
 * @method
 * @param  {RoomObject=} targetOvrd RoomObject.id or any Object contains {pos: RoomPosition}
 * @param   {Object=} optsOvrd Same as [opts] for Room.find(). See: https://docs.screeps.com/api/#Room.find
 * @return {boolean} False if target cannot be found or action cannot be performed, otherwise true
 */
Creep.prototype.go_recharge = function(targetOvrd, optsOvrd) {
    //"use strict";
    // Arguments handling
    const reusePath = 25;
    const task = "recharge";
    const method = "withdraw";
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
        const list = [STRUCTURE_LINK, STRUCTURE_STORAGE, STRUCTURE_CONTAINER];
        // Monkey Patch
        const goal = this.pos.findClosestByRange(FIND_STRUCTURES, Object.assign({
            filter: s => (s.energy > 50 || (s.store && s.store.energy > 50)) && (s.beloning !== "controller" && s.beloning !== "factorio") && (s.structureType === STRUCTURE_LINK || s.structureType === STRUCTURE_STORAGE || s.structureType === STRUCTURE_CONTAINER),
            cache: "deep"
        }, optsOvrd)); // > 50 to prevent drein spawn/extension, no draining from controller, lab area, tower
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
        })
    } else {
        const target = Game.getObjectById(this.memory.target.id)
        const errMsg = this[method](target, _.findKey(target.store, r => r > 0) || RESOURCE_ENERGY);
        switch (errMsg) {
            case OK:
                if (this.carryCapacity > _.sum(this.carry) + (target.energy || _.sum(target.store))) {
                    this.memory.target = undefined;
                }
                break;
            case ERR_NOT_ENOUGH_RESOURCES:
            case ERR_INVALID_TARGET:
            case ERR_FULL:
                // case ERR_INVALID_ARGS:
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

"use strict";
/**
@param {RoomObject=} targetOvrd RoomObject.id or any Object contains {pos: RoomPosition}
@param {Object=} optsOvrd Same as [opts] for Room.find(). See:
https://docs.screeps.com/api/#Room.find

@return {boolean} False if target cannot be found or action cannot be performed, otherwise true
*/
Creep.prototype.go_renew = function(targetOvrd, optsOvrd) {
    const reusePath = 10;
    const task = "renew";
    const method = "renewCreep";
    const range = 1;
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
    if ((this.memory.task && this.memory.task !== task && !targetOvrd) || this.getActiveBodyparts(CLAIM)) {
        return false;
    }
    // Set & lock target
    if (!this.memory.target || targetOvrd) {
        const goal = this.pos.findClosestByPath(Object.values(Game.spawns)) || Game.rooms[this.memory.home].find(FIND_MY_SPAWNS)[0];
        if (!targetOvrd && !goal) return false;
        if (goal.room.energyAvailable < 0.6 * goal.room.energyCapacityAvailable /*|| goal.room.memory.preSpawn*/ ) return false;
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
        const target = Game.getObjectById(this.memory.target.id);
        this.transfer(target, RESOURCE_ENERGY);
        switch (target[method](this)) {
            case OK:
                target.room.visual.text("🔄" + this.memory.role, this.pos, {
                    align: "left",
                    opacity: 0.8
                });
                // if (target.room.memory.preSpawn) this.memory.task = undefined;
                break;
            case ERR_BUSY:
            case ERR_NOT_ENOUGH_RESOURCES:
            case ERR_INVALID_TARGET:
            case ERR_FULL:
            case ERR_INVALID_ARGS:
                this.memory.task = undefined;
                break;
            default:
                this.say(task);
                this.memory.task = undefined;
        }
    }
    if (this.memory.task) return true;
    else return this.memory.target = undefined;
}
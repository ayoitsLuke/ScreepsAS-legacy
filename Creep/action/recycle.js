"use strict";
if (!Creep.prototype._suicide) {
    Creep.prototype._suicide = Creep.prototype.suicide;
    /**
    
    */
    Creep.prototype.suicide = function() {
        this.go_recycle();
        /*
        let distance = ~~(this.ticksToLive / this.speed);
        distance > this.pos.getRangeTo(this.pos.findClosestByPath(FIND_MY_SPAWNS).pos) ? this.go_recycle : this._suicide
        */
    }
}
/**
@param {RoomObject=} targetOvrd RoomObject.id or any Object contains {pos: RoomPosition}
@param {Object=} optsOvrd Same as [opts] for Room.find(). See: 
https://docs.screeps.com/api/#Room.find

@return {boolean} False if target cannot be found or action cannot be performed, otherwise true
*/
Creep.prototype.go_recycle = function(targetOvrd, optsOvrd) {
    const reusePath = 25;
    const task = "recycle";
    const method = "recycleCreep";
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
    if (this.memory.task && this.memory.task !== task && !targetOvrd) {
        return false;
    }
    // Set & lock target
    if (!this.memory.target || targetOvrd) {
        const goal = this.pos.findClosestByPath(Object.values(Game.spawns)) || Game.rooms[this.memory.home].find(FIND_MY_SPAWNS)[0];
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
        const target = Game.getObjectById(this.memory.target.id);
        this.transfer(target, RESOURCE_ENERGY);
        switch (target[method](this)) {
            case OK:
                target.room.visual.text("🗑" + this.memory.role, target.pos.x + 1, target.pos.y, {
                    align: "left",
                    opacity: 0.8
                });
                break;
            case ERR_NOT_ENOUGH_RESOURCES:
            case ERR_INVALID_TARGET:
            case ERR_FULL:
            case ERR_INVALID_ARGS:
                this.memory.task = undefined;
                break;
            default:
                this.memory.task = undefined;
        }
    }
    if (this.memory.task) return true;
    else return this.memory.target = undefined;
}
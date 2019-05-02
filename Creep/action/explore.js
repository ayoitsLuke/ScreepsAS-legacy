"use strict"
/**
@param {RoomObject=} targetOvrd Force harvesting the object
@param {Object=} optsOvrd


@return {boolean} False if Source don't have enough energy

*/
Creep.prototype.go_explore = function(targetOvrd) {
    const task = "explore";
    const range = 20;
    const reusePath = 30;
    // Check creep's task (exit if creep has other task, & no overriding)
    if (this.memory.task && this.memory.task !== task && !targetOvrd) {
        return false;
    }
    // Set & lock target
    if (!this.memory.target || targetOvrd) {
        // sample one of the exits
        const exits = Object.values(Game.map.describeExits(this.room.name));
        const roomName = exits[~~(exits.length * Math.random())]
        this.memory.task = task;
        this.memory.target = {
            pos: new RoomPosition(25, 25, roomName)
        };
    }
    const {
        x,
        y,
        roomName
    } = this.memory.target.pos;
    const targetPos = new RoomPosition(x, y, roomName);
    // Move to target position
    if (this.pos.inRangeTo(targetPos, range)) {
        this.memory.task = undefined;
        this.memory.target = undefined;
        return false;
    } else {
        if (ERR_NO_PATH === this.moveTo(targetPos)) this.memory.target = undefined;
        return true;
    }
};
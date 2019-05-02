"use strict";
/**
@param {RoomObject=} targetOvrd RoomObject.id or any Object contains {pos: RoomPosition}
@param {Object=} optsOvrd Same as [opts] for Room.find(). See: 
https://docs.screeps.com/api/#Room.find

@return {boolean} False if target cannot be found or action cannot be performed, otherwise true
*/
Creep.prototype.go_upgrade = function(targetOvrd, optsOvrd) {
    const reusePath = 10;
    const task = "upgrade";
    const method = "upgradeController";
    const range = CREEP_ACTION_RANGE[method];
    if (optsOvrd === undefined) {
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
    // Sign controller if not
    const signText = "I won't even call myself an amateur.\n" + "Boi, I only took one Java in college"
    if (this.room.controller && this.room.controller.my && (!this.room.controller.sign || this.room.controller.sign.username !== "ayoitsLuke")) {
        if (this.signController(this.room.controller, signText) === ERR_NOT_IN_RANGE) {
            this.moveTo(this.room.controller, {
                range: 1,
                visualizePathStyle: {
                    stroke: '#ff0000'
                }
            });
            this.say("✒", true);
            this.memory.task = task;
            return true;
        }
    }
    // Set & lock target
    if (!this.memory.target || targetOvrd) {
        const goal = Game.rooms[this.memory.home].controller;
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
        this.moveTo(targetPos, {
            range,
            reusePath
        });
    } else {
        const errMsg = this[method](Game.getObjectById(this.memory.target.id));
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
                this.say(errMsg + task);
                this.memory.task = undefined;
        }
    }
    if (this.memory.task) return true;
    else return this.memory.target = undefined;
}
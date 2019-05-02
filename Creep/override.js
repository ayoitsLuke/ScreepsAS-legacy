"use strict";
if (!Creep.prototype._moveTo) {
    Creep.prototype._moveTo = Creep.prototype.moveTo;
    /**
	Wrap .moveTo to .travelTo if it's in different room.

    @param {number | Object} firstArg
    @param {number | Object=} secondArg
    @param {Object=} opts
    @return {number}
    */
    Creep.prototype.moveTo = function(firstArg, secondArg, opts) {
        opts = opts || {};
        const road = this.pos.lookFor(LOOK_STRUCTURES)[0];
        // const site = this.pos.lookFor(LOOK_CONSTRUCTION_SITES)[0] // || this.pos.findInRange(FIND_CONSTRUCTION_SITES, 3)[0];
        if (road && this.carry.energy && !this.memory.urgent && this.getActiveBodyparts(WORK) && (road.hits <= 1000 || road.hits < road.hitsMax - 100 * this.getActiveBodyparts(WORK))) this.repair(road);
        // else if (site && this.carry.energy && this.getActiveBodyparts(WORK)) this.build(site);
        if (firstArg.pos) firstArg = firstArg.pos;
        if (opts && 2 * this.getActiveBodyparts(MOVE) >= this.body.length - this.getActiveBodyparts(CARRY) + Math.ceil(_.sum(this.carry) / 50)) {
            Object.assign(opts, {
                ignoreRoad: true
            })
        }
        if (isNaN(firstArg) && firstArg.roomName !== this.pos.roomName) {
            // if input is a target object & it's not in the same room
            const thisRoomName = this.room.name;
            const destRoomName = firstArg.roomName || firstArg.room.name || firstArg.pos.roomName;
            if (thisRoomName !== destRoomName) {
                return this.travelTo(firstArg, secondArg);
            }
        } else {
            const errMsg = this._moveTo(firstArg, secondArg, opts);
            if (ERR_NO_PATH === errMsg) {
                this.memory.task = undefined;
                this.memory.target = undefined;
            }
            return errMsg;
        }
    }
};
if (!Creep.prototype._say) {
    Creep.prototype._say = Creep.prototype.say;
    /**
	Default .say as public

    @param {number | Object} firstArg
    @param {number | Object=} secondArg
    @param {Object=} opts
    @return {number}
    */
    Creep.prototype.say = function(message, pub) {
        return this._say(message, pub === false ? false : true);
    }
};
"use strict";
/**
@param {RoomObject=} targetOvrd RoomObject.id or any Object contains {pos: RoomPosition}
@param {Object=} optsOvrd Same as [opts] for Room.find(). See: 
https://docs.screeps.com/api/#Room.find

@return {boolean} False if target cannot be found or action cannot be performed, otherwise true
*/
Creep.prototype.go_harvest = function(targetOvrd, optsOvrd) {
    //"use strict";
    const reusePath = 25;
    const task = "harvest";
    const method = "harvest";
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
        const goal = this.room.find(FIND_SOURCES_ACTIVE, Object.assign({
            /*
            filter: s => s.pos.findInRange(FIND_MY_CREEPS, 2, {
                filter: c => c.memory.role === this.memory.role && c.getActiveBodyparts[WORK] > 4
            }).length < 1,
            */
            filter: s => s.productivity < 1,
            claim: true
        }, optsOvrd))[0] || this.room.find(FIND_MINERALS)[0];
        if (!targetOvrd && !goal) return this.memory.task = undefined;;
        const id = targetOvrd ? targetOvrd.id : goal.id;
        const pos = targetOvrd ? (targetOvrd.pos || targetOvrd) : goal.pos;
        this.memory.task = task;
        this.memory.target = {
            id,
            pos
        };
    }
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
        const target = Game.getObjectById(this.memory.target.id);
        const errMsg = this[method](target);
        switch (errMsg) {
            case OK:
                const dc = target.depositContainer;
                const dl = target.depositLink;
                if (dl && this.carry.energy >= this.carryCapacity) {
                    this.transfer(dl, RESOURCE_ENERGY)
                }
                if (dl && !this.pos.isEqualToPos(dc.pos)) {
                    this.moveTo(dc.pos);
                }
                if (this.carry.energy > this.getActiveBodyparts(WORK) && !this.memory.urgent) {
                    if (dc instanceof ConstructionSite || dl instanceof ConstructionSite) this.build(dc) && this.build(dl)
                    else if (dc.hitsMax - dc.hits > REPAIR_POWER * this.getActiveBodyparts(WORK)) this.repair(dc);
                }
                if (this.memory.role !== "staticHarvester" && HARVEST_POWER * this.getActiveBodyparts(WORK) >= this.carryCapacity - _.sum(this.carry)) {
                    this.memory.task = undefined;
                }
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
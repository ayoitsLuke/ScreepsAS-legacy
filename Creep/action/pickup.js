"use strict";
/**
@param {RoomObject=} targetOvrd RoomObject.id or any Object contains {pos: RoomPosition}
@param {Object=} optsOvrd Same as [opts] for Room.find(). See: 
https://docs.screeps.com/api/#Room.find

@return {boolean} False if target cannot be found or action cannot be performed, otherwise true
*/
Creep.prototype.go_pickup = function(targetOvrd, optsOvrd) {
    const reusePath = 20;
    const task = "pickup";
    const method = "pickup";
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
    // Object.assign(optsOvrd || {}, {
    //     all: false
    // });
    // Set & lock target
    if (!this.memory.target || targetOvrd) {
        const goal = this.room.find(FIND_DROPPED_RESOURCES, {
            filter: r => r.resourceType !== RESOURCE_ENERGY
        })[0] || this.room.find(FIND_DROPPED_RESOURCES, Object.assign({
            // filter: r => r.amount > 10,
            max: r => {
                // console.log("go_pickup() {max:}", this.name);
                const decayPerTick = Math.ceil(r.amount / 1000); /// est. decayed amount
                const harvester = r.pos.lookFor(LOOK_CREEPS)[0];
                // What if there's a link/container nearby? so the resource will not be dropped
                const harvestPerTick = harvester ? HARVEST_POWER * harvester.getActiveBodyparts(WORK) : 0;
                // console.log("harvestPerTick", harvestPerTick);
                const creationEnergy = this.body.reduce((totalCost, p) => totalCost + BODYPART_COST[p.type], 0); // how much energy spent on this creep during creation
                const cePerTick = creationEnergy / CREEP_LIFE_TIME; // average those creation energy to each ticks of its life time
                const estTravelTime = 5 * this.pos.getRangeTo(r.pos); // Back (2 tick/square) and forth (1 tick/square) -> 3 times linear distance. Because it's not findPathTo, tune up to 5
                // console.log(estTravelTime, r instanceof RoomObject)
                const estAmount = r.amount + estTravelTime * (harvestPerTick - decayPerTick - cePerTick); // est. energy left in pile upon arrival
                return (estTravelTime > this.ticksToLive || estAmount < 0) ? undefined : (estAmount < this.carryCapacity) ? estAmount : Number.MAX_SAFE_INTEGER - estTravelTime;
            },
            // debug: true,
            claim: !this.memory.urgent && !optsOvrd.all
        }, optsOvrd))[0];
        if (!targetOvrd && !goal) return this.memory.task = undefined;;
        console.log("go_pickup", this.name, goal.id, goal.pos.x, goal.pos.y)
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
    // Move to target position
    if (!this.pos.inRangeTo(targetPos, range)) {
        this.moveTo(targetPos, {
            range,
            reusePath
        });
    } else {
        const target = Game.getObjectById(this.memory.target.id)
        const errMsg = this[method](target);
        switch (errMsg) {
            case OK:
                if (target.amount < this.carryCapacity - _.sum(this.carry)) {
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
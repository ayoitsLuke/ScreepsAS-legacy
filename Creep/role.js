"use strict";
Creep.prototype.role_pioneer = function() {
    this.suicide();
    return
    if (this.go_refill()) return;
    if (this.go_pickup()) return;
    if (this.go_harvest()) return;
};
Creep.prototype.role_staticHarvester = function(opts) {
    // if (this.ticksToLive === CREEP_SPAWN_TIME * this.body.length) {
    //     Game.rooms[this.memory.home].memory.spawnQueue.unshift({
    //         role: this.memory.role,
    //         remoteSource: this.memory.remoteSource
    //     });
    // }
    if (_.sum(this.carry) > this.carry.energy) this.go_refill();
    if (this.go_harvest()) return;
};
Creep.prototype.role_remoteHarvester = function(opts) {
    if (this.room.controller && this.room.controller.owner && this.room.controller.owner.username !== "ayoitsLuke") this.say("🏳")
    // if (this.ticksToLive === CREEP_SPAWN_TIME) {
    //     Game.rooms[this.memory.home].memory.spawnQueue.push({
    //         role: this.memory.role,
    //         remoteSource: this.memory.remoteSource
    //     });
    // }
    if (!this.memory.remoteSource) {
        if (this.go_explore()) return;
        const rs = this.room.find(FIND_SOURCES, {
            filter: s => s.energy === s.energyCapacity,
            claim: true,
            random: true
        })[0];
        if (rs) {
            this.memory.remoteSource = {
                id: rs.id,
                pos: rs.pos
            };
        }
        if (Game.rooms[this.memory.remoteSource.pos.roomName].controller.my) {
            this.memory.remoteSource = undefined;
        }
    }
    // const {
    //     x,
    //     y,
    //     roomName
    // } = this.memory.remoteSource.pos;
    // const rs = {
    //     id: this.memory.remoteSource.id,
    //     pos: new RoomPosition(x, y, roomName)
    // };
    if (this.go_refill()) return;
    if (this.go_harvest(this.memory.remoteSource)) return;
};
Creep.prototype.role_scavenger = function(opts) { // need to fix
    if (this.go_refill()) return;
    if (this.go_pickup(opts)) return;
    else if (this.go_recharge(opts)) return;
    //this.go_recycle();
};
Creep.prototype.role_hauler = function() {};
Creep.prototype.role_upgrader = function(opts) {
    if (this.go_upgrade()) return;
    let link = this.room.find(FIND_MY_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_LINK && s.belonging === "controller"
    })[0];
    if (link && link.energy) return this.go_recharge(link);
    else if (this.go_pickup( /*opts*/ )) return;
    else if (this.go_recharge( /*opts*/ )) return;
    //this.go_recycle();
};
Creep.prototype.role_wallBreaker = function() {
    /*
    const wall = this.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_WALL
        //cache: "deep"
    });
    if (this.dismantle(wall) !== OK) {
        this.moveTo(wall)
    }*/
}
Creep.prototype.role_builder = function(opts) {
    if (this.go_build(opts)) return;
    if (this.go_pickup(opts)) return;
    else if (this.go_recharge(opts)) return;
    //if (this.go_pickup()) return;
    //this.go_recycle();
};
Creep.prototype.role_repairer = function(opts) {
    if (this.go_repair(opts)) return;
    if (this.go_build(opts)) return;
    if (this.go_pickup(opts)) return;
    else if (this.go_recharge(opts)) return;
};
Creep.prototype.role_scout = function(opts) {
    this.go_explore();
};
Creep.prototype.role_explorer = function(opts) {
    const pos = new RoomPosition(13, 35, "W31N42");
    if (!this.pos.isNearTo(pos)) this.moveTo(pos);
    this.reserveController(Game.getObjectById("5bbcab3f9099fc012e633298"));
    if (Game.gcl > this.room.find(FIND_MY_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_CONTROLLER && s.my
        })) this.claimController(Game.getObjectById("5bbcab3f9099fc012e633298"))
    // if (this.go_explore()) return;
    // if (this.room.find(FIND_SOURCES).length > 1) this.claimController(this.room.controller);
};
Creep.prototype.role_reserver = function(opts) {};
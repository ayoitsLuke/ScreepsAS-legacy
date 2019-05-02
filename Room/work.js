"use strict";
// This doc connect each creep's role to it's action/task
// Note: keep go_* simple and define condition in role to action
// All go_* can recieve a object as param to force
//pass a opts into go_* to get a reuse target ID???
Room.prototype.work = function() {
    this.init();
    this.statusQuo();
    this.setSpawnQueue();
    this.assignTask();
    _.invoke(this.find(FIND_MY_STRUCTURES, {
        // cache: "deep"
    }), "work");
    /*_.invoke(this.find(FIND_MY_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_LINK,
        cache: "deep"
    }), "work");
    const links = this.find(FIND_MY_STRUCTURES, {
        cache: true,
        filter: s => s.structureType === STRUCTURE_LINK
    });*/
    this.hud();
}

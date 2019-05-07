"use strict";
Creep.prototype.work = function() {
    this.getTask();
    this.doTask();
};
Creep.prototype.getTask = function() {
    this.memory.task
};
Creep.prototype.doTask = function() {
    this.say(TASK2SAY[this.memory.task]);
    if (!this.memory.task) this.memory.target = undefined;
    // if (this.ticksToLive === CREEP_SPAWN_TIME * this.body.length) {
    //     Game.rooms[this.memory.home].memory.spawnQueue.push({
    //         role: this.memory.role,
    //         remoteSource: this.memory.remoteSource
    //     });
    // }
    if (this.memory.task === "recycle") this.go_recycle();
    if ((!this.memory.urgent && this.ticksToLive < 0.2 * CREEP_LIFE_TIME) || this.memory.task === "renew") {
        if (this.go_renew()) return;
    }
    if (this.carry.energy < _.sum(this.carry) || this.memory.task === "refill") this.go_refill();
    // Clear all mineral in carry
    try {
        /*
        if (Game.time % (this.name.hashCode() % 50)) {
            if (this.pos.x === 0) return this.move(RIGHT);
            else if (this.pos.x === 49) return this.move(LEFT);
            else if (this.pos.y === 0) return this.move(BOTTOM);
            else if (this.pos.y === 49) return this.move(TOP);
        }
        */
        // const role = "role_" + this.memory.role;
        // if (role) {
        //     this.role({
        //         all: (!this.room.controller || this.room.controller.level > 3)
        //     });
        // }
        if (this.memory.role) {
            const role = this["role_" + this.memory.role];
            if (role) {
                role.bind(this)({
                    all: Game.rooms[this.memory.home].controller.level > 3 && !this.memory.urgent
                }) // What does () do?
            } else {
                console.log("[WARNING] Unknown role: " + this.memory.role + " for creep: " + this.name);
            }
        } else {
            this.go_recycle();
            console.log("[WARNING] Creep without role: " + this.name);
        }
        if (Game.rooms[this.memory.home].controller.level < 3) {
            if (this.go_harvest()) return;
        }
        if (!this.memory.task) {
            this.room.visual.text("X", this.pos, {
                strokeWidth: 5,
                font: 1,
                color: "#FF0000"
            })
        }
        // if (this.go_recycle()) return;
    } catch (e) {
        this.room.visual.text(this.name + " " + this.memory.task + " " + e, this.pos, {
            font: "bold 0.8 helvetica",
            color: "#FF0000"
        })
        console.log(e);
        //this._suicide();
    }
}

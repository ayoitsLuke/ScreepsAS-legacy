"use strict";
StructureLink.prototype.work = function(avgEnergy) {
    if (this.belonging === "source" && this.energy >= this.energyCapacity) {
        let anotherLink = this.room.find(FIND_MY_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_LINK && s.belonging !== "source" && s.energy < s.energyCapacity - 100,
            min: s => s.energy,
            claim: true
        })[0];
        this.transferEnergy(anotherLink)
    }
};
Object.defineProperties(StructureLink.prototype, {
    belonging: {
        configurable: true,
        get: function() {
            if (!this.global.belonging) {
                if (this.pos.findInRange(FIND_SOURCES, 2).length) {
                    this.global.belonging = "source";
                }
                if (this.pos.findInRange(FIND_MINERALS, 2).length) {
                    this.global.belonging = "mineral";
                }
                if (this.pos.inRangeTo(this.room.controller, 4)) {
                    this.global.belonging = "controller";
                }
                if (this.pos.findInRange(FIND_MY_STRUCTURES, 2, {
                        filter: s => s.structureType === STRUCTURE_TOWER || s.structureType === STRUCTURE_EXTENSION
                    }).length > 4) {
                    this.global.belonging = "outpost";
                }
                if (this.pos.findInRange(FIND_MY_STRUCTURES, 2, {
                        filter: s => s.structureType === STRUCTURE_LAB
                    }).length) {
                    this.global.belonging = "factorio";
                }
            }
            return this.global.belonging;
        },
        set: function(value) {
            this.global.belonging = value;
        }
    }
});
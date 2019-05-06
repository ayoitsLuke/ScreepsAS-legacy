Room.prototype.init = function() {
    if (!Memory.rooms) Memory.rooms = {};
    if (Memory.rooms[this.name]) return;
    // source, mineral, portal, powerBank
    this.memory.sources = this.find(FIND_SOURCES).map(s => {
        return {
            id: s.id,
            pos: s.pos
        }
    });
    this.memory.minerals = this.find(FIND_MINERALS).map(m => {
        return {
            id: m.id,
            pos: m.pos,
            mineralType: m.mineralType
        }
    });
    this.memory.hostileStructures = this.find(FIND_HOSTILE_STRUCTURES).map(s => {
        return {
            id: s.id,
            pos: s.pos,
            structureType: s.structureType
        }
    });
    this.memory.powerBank = this.find(FIND_HOSTILE_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_POWER_BANK
    }).map(m => {
        return {
            id: m.id,
            pos: m.pos,
        }
    });
    this.memory.portal = this.find(FIND_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_PORTAL
    }).map(m => {
        return {
            id: m.id,
            pos: m.pos,
        }
    });
    if (this.controller && this.controller.my && this.controller.level === 1) {
        const sources = this.find(FIND_SOURCES);
        for (s of sources) {
            // find closest square
        }
    }
    /*
    if (!this.memory.roomType) {
        if (this.controller) {
            if (this.controller.my) {
                this.memory.roomType = "main"
            } else if (this.controller.reservation === "ayoitsLuke") {
                this.memory.roomType = "reserved"
            } else {
                this.memory.roomType = "blank"
            }
        } else {
            if (this.find(FIND_SOURCES).length > 0) {
                this.memory.roomType = "mine"
            }
        }
    }
    */
};

function findEmptySquareInRoom() {

}

// ALL CODES HERE ARE JUST RANDOM THOUGHTS. THEY'LL NEED TO MOVE TO PROPER FOLDER
/*
What I need to overwrite?
1. find()
2. moveTo()
*/
//
// new Methods
StructureTower.prototype.work = function() {
    // body...
};
StructureLink.prototype.work = function() {
    // body...
};
/*
Object.defineProperties(Room.prototype, {
    sources: {
        get: function() {
            // If we don't have the value stored locally
            if (!this._sources) {
                // If we don't have the value stored in memory
                if (!this.memory.sourceIds) {
                    // Find the sources and store their id's in memory,
                    this.memory.sourceIds = this.find(FIND_SOURCES).map(source => source.id);
                }
                // Get the source objects from the id"s in memory and store them locally
                this._sources = this.memory.sourceIds.map(id => Game.getObjectById(id));
            }
            // return the locally stored value
            return this._sources;
        },
        set: function(newValue) {
            // when storing in memory you will want to change the setter
            // to set the memory value as well as the local value
            this.memory.sourceIds = newValue.map(source => source.id);
            this._sources = newValue;
        },
        enumerable: false,
        configurable: true
    },
    minerals: {
        get: function() {
            // If we dont have the value stored locally
            if (!this._minerals) {
                // If we dont have the value stored in memory
                if (!this.memory.mineralIds) {
                    // Find the sources and store their id"s in memory,
                    this.memory.mineralIds = this.find(FIND_MINERALS).map(mineral => mineral.id);
                }
                // Get the mineral objects from the id"s in memory and store them locally
                this._minerals = this.memory.mineralIds.map(id => Game.getObjectById(id));
            }
            // return the locally stored value
            return this._minerals;
        },
        set: function(newValue) {
            // when storing in memory you will want to change the setter
            // to set the memory value as well as the local value
            this.memory.mineralIds = newValue.map(mineral => mineral.id);
            this._minerals = newValue;
        },
        enumerable: false,
        configurable: true
    }
});
*/
/*
if (!Room.prototype.constructionPriority) {
    Object.defineProperty(Room.prototype, "constructionPriority", {
        // @para objArray = [STRUCTURE_*, ...] from least to most important.
        set: function(structureArray) {
            this.constructionPriority = structureArray;
            this.memory.constructionPriority = structureArray;
        },
        get: function() {
            // If we dont have the value stored locally
            if (!this.constructionPriority) {
                // If we dont have the value stored in memory
                if (!this.memory.constructionPriority) {
                    this.memory.constructionPriority = [];
                }
                // Get the source objects from the id"s in memory and store them locally
                this.constructionPriority = this.memory.constructionPriority;
            }
            // return the locally stored value
            return this.constructionPriority;
        },
    });
}
*/
//
//
//
/*
if (!StructureSpawn.prototype._spawnCreep) {
    StructureSpawn.prototype._spawnCreep = StructureSpawn.prototype.spawnCreep
    StructureSpawn.prototype.spawnCreep = function(body, name, opts) {
        // 1 input: role{string}
        // 2 input: body& name
        if (!opts) {}
        let arg1 = body.toString().split(",");
        let role = opts.memory.role || "";
        this.room.visual.text("🛠️" + role, this.pos.x + 1, this.pos.y, {
            align: "left",
            opacity: .8
        });
        return this._spawnCreep(arg1, name, opts);
    }
}
*/
//***/
/*StructureSpawn.prototype.spawnCreep = function(first_argument) {
    this.memory.spawnQueue;
};*/
//
Object.defineProperties(Creep.prototype, {
    isFull: {
        get: function() {
            if (!this._isFull) {
                this._isFull = _.sum(this.carry) === this.carryCapacity;
            }
            return this._isFull;
        },
        configurable: true
    },
    hp: {
        value: function() {
            if (!this._hp) {
                this._hp = 100 * this.hits / this.hitsMax;
            }
            return this._hp;
        }
    },
    speed: {
        /**
        Creep speed on road (tick/square). Minimum 1 
        */
        get: function() {
            if (!this._speed) {
                let move = this.getActiveBodyparts(MOVE);
                let allCarry = this.getActiveBodyparts(CARRY)
                let fullCarry = Math.ceil(_.sum(creep.carry) / 50);
                let emptyCarry = allCarry - fullCarry;
                let allParts = this.body.length;
                let partsGenFat = allParts - move - emptyCarry;
                let result = 1 + ~~(partsGenFat / 2 * move)
                let result = 1 + ~~(this.body.length - move - (this.getActiveBodyparts(CARRY) - (1 + ~~(_.sum(creep.carry) / 50))) / (2 * move))
                this._speed = result > 0 ? result : 1
            }
            return this._speed;
        },
    },
});
/**
Improve moveTo by adding

*/
Object.defineProperties(Room.prototype, {
    harvestSlots: {
        get: function() {
            if (this._allSpace == undefined) {
                if (this.memory.harvestSpace == undefined) {
                    let allSpace = 0;
                    for (const source in this.sources) {
                        allSpace += source.freeSpaceCount;
                    }
                    this.memory.harvestSpace = allSpace;
                }
                this._allSpace = this.memory.harvestSpace;
            }
            return this._allSpace;
        },
        enumerable: false,
        configurable: true
    }
});
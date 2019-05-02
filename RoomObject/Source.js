Object.defineProperties(Source.prototype, {
    /*
    memory: {
        configurable: true,
        get: function() {
            if (_.isUndefined(Memory.sources)) {
                Memory.sources = {};
            }
            if (!_.isObject(Memory.sources)) {
                return undefined;
            }
            return Memory.sources[this.id] = Memory.sources[this.id] || {};
        },
        set: function(value) {
            if (_.isUndefined(Memory.sources)) {
                Memory.sources = {};
            }
            if (!_.isObject(Memory.sources)) {
                throw new Error("Could not set source memory");
            }
            Memory.sources[this.id] = value;
        }
    },
    */
    freeSpaceCount: {
        // enumerable: false,
        // configurable: true,
        get: function() {
            if (!this._freeSpaceCount) {
                if (!this.memory.freeSpaceCount) {
                    let freeSpaceCount = 0;
                    const roomTerrain = Game.map.getRoomTerrain(this.room.name)[this.pos.x - 1, this.pos.x, this.pos.x + 1].forEach(x => {
                        [this.pos.y - 1, this.pos.y, this.pos.y + 1].forEach(y => {
                            if (roomTerrain.get(x, y) !== TERRAIN_MASK_WALL) freeSpaceCount++;
                        }, this);
                    }, this);
                    this.memory.freeSpaceCount = freeSpaceCount;
                }
                this._freeSpaceCount = this.memory.freeSpaceCount;
            }
            return this._freeSpaceCount;
        }
    },
    productionPerTick: { // How many energy produced per tick within current regen time. 
        // enumerable: false,
        // configurable: true,
        get: function() {
            if (!this._productionPerTick) {
                this._productionPerTick = (this.energyCapacity - this.energy) / (ENERGY_REGEN_TIME - (this.ticksToRegeneration ? this.ticksToRegeneration : 0));
            }
            return this._productionPerTick;
        }
    },
    productivity: { // The productivity of this source. 1 as a perfect production ratio when all energy harvested as soon as the source regen
        // enumerable: false,
        // configurable: true,
        get: function() {
            if (!this._productivity) {
                this._productivity = this.productionPerTick / (this.energyCapacity / ENERGY_REGEN_TIME);
            }
            return this._productivity;
        }
    },
    depositContainer: {
        get: function() {
            if (!this.global.depositContainer) {
                const container = this.pos.findInRange(FIND_STRUCTURES, 1, {
                    filter: s => s.structureType === STRUCTURE_CONTAINER,
                    cache: "deep"
                })[0] || this.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
                    filter: c => c.structureType === STRUCTURE_CONTAINER
                })[0];
                if (container) {
                    this.global.depositContainer = {
                        id: container.id,
                        pos: container.pos
                    };
                } else {
                    const pos = this.pos.findPathTo(this.room.find(FIND_MY_SPAWNS)[0], {
                        range: 3,
                        ignoreCreeps: true,
                        ignoreDestructibleStructures: true,
                        ignoreRoads: true
                    })[0];
                    return this.room.createConstructionSite(pos.x, pos.y, STRUCTURE_CONTAINER);
                }
            }
            const {
                x,
                y,
                roomName
            } = this.global.depositContainer.pos;
            return Game.getObjectById(this.global.depositContainer.id) || new RoomPosition(x, y, roomName);
        }
    },
    depositLink: {
        get: function() {
            if (this.room.controller && this.room.controller.my && this.room.controller.level < 5) return;
            if (!this.memory.depositLink) {
                const link = this.pos.findInRange(FIND_MY_STRUCTURES, 2, {
                    filter: s => s.structureType === STRUCTURE_LINK,
                    cache: "deep"
                })[0] || this.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 2, {
                    filter: c => c.structureType === STRUCTURE_LINK
                })[0];
                if (link) {
                    this.memory.depositLink = {
                        id: link.id,
                        pos: link.pos
                    };
                } else {
                    const pos = this.pos.findPathTo(this.room.controller, {
                        range: 3,
                        ignoreCreeps: true,
                        ignoreDestructibleStructures: true,
                        ignoreRoads: true,
                        maxRooms: 1,
                        swampCost: 1
                    })[1];
                    return this.room.createConstructionSite(pos.x, pos.y, STRUCTURE_LINK);
                }
            }
            const {
                x,
                y,
                roomName
            } = this.memory.depositLink.pos;
            return Game.getObjectById(this.memory.depositLink.id) || new RoomPosition(x, y, roomName);
        }
    },
    bufferStructure: {
        get: function() {
            this.depositContainer;
            return this.depositLink || this.depositContainer;
        }
    }
});
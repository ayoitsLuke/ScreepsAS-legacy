Object.defineProperties(Source.prototype, {
  freeSpaceCount: {
    // enumerable: false,
    // configurable: true,
    get: function() {
      if (!this.global.freeSpaceCount) {
        if (!this.memory.freeSpaceCount) {
          let freeSpaceCount = 0;
          const roomTerrain = Game.map.getRoomTerrain(this.room.name)[this.pos.x - 1, this.pos.x, this.pos.x + 1].forEach(x => {
            [this.pos.y - 1, this.pos.y, this.pos.y + 1].forEach(y => {
              if (roomTerrain.get(x, y) !== TERRAIN_MASK_WALL) freeSpaceCount++;
            }, this);
          }, this);
          this.memory.freeSpaceCount = freeSpaceCount;
        }
        this.global.freeSpaceCount = this.memory.freeSpaceCount;
      }
      return this._freeSpaceCount;
    }
  },
  productionPerTick: { // How many energy produced per tick within current regen time.
    // enumerable: false,
    // configurable: true,
    get: function() {
      if (!this.global.productionPerTick) {
        this._productionPerTick = (this.energyCapacity - this.energy) / (ENERGY_REGEN_TIME - (this.ticksToRegeneration ? this.ticksToRegeneration : 0));
      }
      return this.global.productionPerTick;
    }
  },
  productivity: { // The productivity of this source. 1 as a perfect production ratio when all energy harvested as soon as the source regen
    // enumerable: false,
    // configurable: true,
    get: function() {
      if (!this.global.productivity) {
        this.global.productivity = this.productionPerTick / (this.energyCapacity / ENERGY_REGEN_TIME);
      }
      return this._productivity;
    }
  },
  container: {
    get: function() {
      if (!this.global.container) {
        const container = this.pos.findInRange(FIND_STRUCTURES, 1, {
          filter: s => s.structureType === STRUCTURE_CONTAINER,
          cache: "deep"
        })[0] || this.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
          filter: c => c.structureType === STRUCTURE_CONTAINER
        })[0];
        if (container) {
          this.global.container = {
            id: container.id,
            pos: container.pos
          };
        } else {
          const pos = this.pos.findPathTo(this.room.controller || this.pos.findClosestByPath(FIND_MY_SPAWNS, {
            all: true
          }), {
            range: 3,
            ignoreCreeps: true,
            ignoreDestructibleStructures: true,
            ignoreRoads: true
          })[0];
          return this.room.createConstructionSite(pos.x, pos.y, STRUCTURE_CONTAINER);
        }
      }
      // TODO simplify x,y,roomName into new RoomPosition
      const {
        x,
        y,
        roomName
      } = this.global.container.pos;
      return Game.getObjectById(this.global.container.id) || {
        id: this.global.container.id,
        pos: new RoomPosition(x, y, roomName)
      };
    }
  },
  link: {
    get: function() {
      if (this.room.controller && this.room.controller.my && this.room.controller.level < 5) return;
      if (this.memory.link) return Game.getObjectById(this.memory.link.id);
      else {
        const link = this.pos.findInRange(FIND_MY_STRUCTURES, 2, {
          filter: s => s.structureType === STRUCTURE_LINK,
          cache: "deep"
        })[0] || this.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 2, {
          filter: c => c.structureType === STRUCTURE_LINK
        })[0];
        if (link) {
          this.global.link = {
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
      } = this.global.link.pos;
      return Game.getObjectById(this.global.link.id) || {
        id: this.global.container.id,
        pos: new RoomPosition(x, y, roomName)
      }
    }
  },
  warehouse: {
    get: function() {
      const link = this.link;
      const container = this.container;
      return (link instanceof Structure && link.energy < link.energyCapacity) ? link : (container instanceof Structure) ? container : undefined;
    }
  }
});

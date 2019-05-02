"use strict"
Object.defineProperties(Room.prototype, {
    type: {
        get: function() {
            if (!this.memory.type) {
                if (/^[WE]\d*0[NS]\d*0$/.test(this.name)) this.memory.type = "alley";
                if (/(^[WE]\d*5[NS]\d*5$)|(^[WE]\d*5[NS]\d*5$)/.test(this.name)) this.memory.type = "core"
                // let isCenterRoom = /^[WE]\d*[4-6]+[NS]\d*[4-6]+$/.test(this.name); // = core room + sk rooms
                if (/(^[WE]\d*[4-6][NS]\d*[4|6]$)|(^[WE]\d*[4|6][NS]\d*[4-6]$)/.test(this.name)) this.memory.type = "sourceKeeper"
                if (/(^[WE]\d*[1-9]+[NS]\d*[1-3|7-9]+$)|(^[WE]\d*[1-3|7-9]+[NS]\d*[1-9]+$)/.test(this.name)) {
                    this.memory.type = "controller";
                    if (this.controller.level) this.memory.type = "hostile";
                    if (this.controller.my) this.memory.type = "my";
                }
            }
            return this.memory.type;
        }
    },
    productionPerTick: {
        // enumerable: false,
        // configurable: true,
        get: function() {
            if (!this._productionPerTick) {
                let ppt = 0; // Production per tick
                this.find(FIND_SOURCES).forEach(s => ppt += s.productionPerTick);
                this._productionPerTick = ppt
            }
            return this._productionPerTick;
        }
    },
    productivity: {
        // enumerable: false,
        // configurable: true,
        get: function() {
            if (!this._productivity) {
                let prod = 0; // Production per tick
                let sc = 0; // Source count
                this.find(FIND_SOURCES).forEach(s => {
                    prod += s.productivity;
                    sc++;
                });
                this._productivity = prod / sc;
            }
            return this._productivity;
        }
    },
    sourceSpace: {
        get: function() {
            if (!this.memory.sourceSpace) {
                // let space = 0; // Space per source
                // this.find(FIND_SOURCES).forEach(s => space += s.freeSpaceCount);
                // this.memory.sourceSpace = space;
                this.memory.sourceSpace = this.find(FIND_SOURCES).reduce((totalSpace, s) => totalSpace + s.freeSpaceCount, 0); // h
            }
            return this.memory.sourceSpace;
        }
    },
    efficiency: {
        configurable: true,
        get: function() {
            // body...
        }
    },
    refillSpeed: { // need to rename & fix this monkey coding
        configurable: true,
        get: function() {
            if (!this.memory.refillData) this.memory.refillData = [];
            while (this.memory.refillData.length > 10) this.memory.refillData.shift();
            return this.memory.refillData;
        },
        set: function(energyAvailable, time) {
            energyAvailable = energyAvailable || this.energyAvailable;
            time = time || Game.time;
            if (!this.memory.refillData) this.memory.refillData = [];
            this.memory.refillData.push([time, energyAvailable]);
        }
    },
    avgTenSpawnTime: {
        configurable: true,
        get: function() {
            //
        },
        set: function(value) {
            //
        }
    }
});
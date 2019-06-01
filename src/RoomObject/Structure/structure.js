Object.defineProperties(Structure.prototype, {
  area: {
    configurable: true,
    get: function() { // TODO check for exception
      if (!this.memory.area) {
        let area = "";
        if (this.pos.findInRange(FIND_MY_STRUCTURES, 2, {
            filter: s => s.structureType === STRUCTURE_EXTENSION
          })
          .length >= 3) {
          area = "outpost";
        }
        if (this.pos.findInRange(FIND_MY_STRUCTURES, 2, {
            filter: s => s.structureType === STRUCTURE_LAB
          })
          .length) {
          area = "factory";
        }
        if (this.pos.findInRange(FIND_SOURCES, 2)
          .length) {
          area = "source";
        }
        if (this.pos.findInRange(FIND_MINERALS, 2)
          .length) {
          area = "mineral";
        }
        if (this.pos.inRangeTo(this.room.controller, 4)) {
          area = "controller";
        }
        this.global.area = area;
      }
      return this.global.area;
    },
    set: function(value) {
      this.global.area = value;
    }
  }
});
/**
 * TODO
 * @method name description
 * @param action
 * @returns {String} property `default` description
 */
Structure.prototype.generateTask = function() {
  if (this.memory.taskSent) return;
  const {
    structureType
  } = this;
  let task = {};
  switch (structureType) {
    case STRUCTURE_CONTROLLER:
      if (this.my && (this.level < 8 || this.ticksToDowngrade < CONTROLLER_DOWNGRADE_SAFEMODE_THRESHOLD)) this.pushTask("upgradeController");
      const roomDistance = Game.map.findRoute(this.room.name, this.home.name, {
        routeCallback: preferAlley // TODO check if this work
      });
      if (this.room.type === "netural" && roomDistance <= Math.ceil(this.home.controller.level / 3)) this.pushTask("reserveController", {
        resourceType: null
      })
      break;
    case STRUCTURE_EXTENSION:
    case STRUCTURE_SPAWN:
    case STRUCTURE_TOWER:
      if (this.energyCapacity - this.energy) this.pushTask("transfer");
      break;
    case STRUCTURE_CONTAINER:
      if (_.sum(this.store) >= STRUCTURE_FULL_THRESHOLD * this.storeCapacity && (this.area === "source" || this.area === "mineral")) Object.keys(this.store)
        .forEach(r => this.pushTask("withdraw", {
          resourceType: r
        }));
    case STRUCTURE_RAMPART:
    case STRUCTURE_WALL:
      // TODO secondary task, excess resource goes here
      break;
    case STRUCTURE_ROAD:
      if (this.hitsMax - this.hits > this.home.spawns[0].getBodyFor("Worker_m_hc")
        .reduce((t, p) => t + (p === WORK), 0)) this.pushTask("repair");
      break;
    case STRUCTURE_LINK: // No need unless war time
      break;
    case STRUCTURE_KEEPER_LAIR: // TODO Spawn military creep when it's about respawn
      break;
    case STRUCTURE_STORAGE:
    case STRUCTURE_TERMINAL:
      // TODO secondary task, excess resource goes here
      break;
    case STRUCTURE_OBSERVER: // No need
      break;
    case STRUCTURE_POWER_BANK: // TODO Let military do this instead of civillian creeps
      break;
    case STRUCTURE_POWER_SPAWN:
      if (this.energyCapacity - this.energy) this.pushTask("transfer");
      if (this.powerCapacity - this.power) this.pushTask("transfer", {
        resourceType: RESOURCE_POWER,
        amount: this.powerCapacity - this.power
      })
      break;
    case STRUCTURE_EXTRACTOR: // No need
      break;
    case STRUCTURE_LAB: // TODO let creepOfScience handle this
      break;
    case STRUCTURE_NUKER:
      if (this.energyCapacity - this.energy) this.pushTask("transfer");
      if (this.ghodiumCapacity - this.ghodium) this.pushTask("transfer", {
        resourceType: RESOURCE_GHODIUM,
        amount: this.ghodiumCapacity - this.ghodium
      })
      break;
    case STRUCTURE_PORTAL: // No need
      break;
    default:
      break;
  }
};
/**
 * TODO classify actions as "to" or "from" eg. withdraw is from while repair is to.
 * [pushTask description]
 * @param   {string}  action
 * @param   {object}  [resource=Object]
 * @param   {string}  [resource.resourceType=RESOURCE_ENERGY]
 * @param   {number}  [resource.amount]
 */
Structure.prototype.pushTask = function(action, resource) {
  const direction = CREEP_ACTION[action].enthalpy > 0 ? "from" : "to";
  if (!resource) resource = {
    resourceType: RESOURCE_ENERGY
  };
  this.home.memory.task[direction].push({
    action,
    resource,
    target: this.simplify
  });
}
/**
 * A helper function to feed the `routeCallback` option of [Game.map.findRoute()]{@link https://github.com/screeps/engine/blob/212ca299d6f24f2bcc88f1dcf1861b958fc32645/src/game/map.js#L64}
 * @see https://docs.screeps.com/api/#Game.map.findRoute
 *
 * @param   {string}  roomName      [roomName description]
 * @param   {string}  [fromRoomName]  [fromRoomName description]
 *
 * @return  {number}                The cost of each tile
 */
function preferAlley(roomName, fromRoomName) {
  let roomMemory = Memory.rooms[roomName];
  if (!roomMemory) return 1;
  switch (roomMemory.type) {
    case "hostile":
      return Infinity;
    case "alley":
    case "my":
      return 1;
    default:
      return 1.5;
  }
};

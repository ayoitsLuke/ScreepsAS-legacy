Object.defineProperties(Structure.prototype, {
  area: {
    configurable: true,
    get: function() { // TODO debug for exception
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
 * Check sturcuture's status and generate a list of tasks
 *
 * @return {Object[]}
 */
Structure.prototype.generateTask = function() {
  if (this.memory.taskSent) return;
  let task = [];
  switch (this.structureType) {
    case STRUCTURE_CONTROLLER:
      if (this.type === "my" && (this.level < 8 || this.ticksToDowngrade < CONTROLLER_DOWNGRADE_SAFEMODE_THRESHOLD)) task.push(this.newTask("upgradeController"), {
        resourceType: RESOURCE_ENERGY,
      });
      if (this.room.type === "netural") {
        const roomDistance = Game.map.findRoute(this.room.name, this.home.name, {
          routeCallback: preferHighwayAndOwned // TODO debug
        });
        if (roomDistance < Math.ceil(this.home.controller.level / 3)) {
          task.push(this.newTask("reserveController"));
        }
      }
      break;
    case STRUCTURE_EXTENSION:
    case STRUCTURE_SPAWN:
    case STRUCTURE_TOWER:
      if (this.energyCapacity - this.energy) task.push(this.newTask("transfer", {
        resourceType: r,
        amount: this.energyCapacity - this.energy,
      }));
      break;
    case STRUCTURE_CONTAINER:
      if (_.sum(this.store) >= STRUCTURE_FULL_THRESHOLD * this.storeCapacity && (this.area === "source" || this.area === "mineral")) Object.keys(this.store)
        .forEach(r => task.push(this.newTask("withdraw", {
          resourceType: r,
          amount: this.store[r],
        })));
    case STRUCTURE_STORAGE:
    case STRUCTURE_TERMINAL:
      // TODO secondary task, excess resource goes here
      break;
    case STRUCTURE_RAMPART:
    case STRUCTURE_WALL:
      // TODO secondary task, excess resource goes here
      break;
    case STRUCTURE_ROAD:
      if (this.hitsMax - this.hits > this.home.spawns[0].getBodyFor("Worker_m_hc")
        .reduce((t, p) => t + (p === WORK), 0)) task.push(this.newTask("repair", {
        resourceType: RESOURCE_ENERGY,
        amount: (this.hitsMax - this.hits) * REPAIR_COST,
      }));
      break;
    case STRUCTURE_KEEPER_LAIR:
      // TODO Spawn military creep when it's about respawn
      break;
    case STRUCTURE_POWER_BANK:
      // TODO Let military do this instead of civillian creeps
      break;
    case STRUCTURE_POWER_SPAWN:
      if (this.energyCapacity - this.energy) task.push(this.newTask("transfer", {
        resourceType: RESOURCE_ENERGY,
        amount: this.energyCapacity - this.energy
      }));
      if (this.powerCapacity - this.power) task.push(this.newTask("transfer", {
        resourceType: RESOURCE_POWER,
        amount: this.powerCapacity - this.power
      }));
      break;
    case STRUCTURE_NUKER:
      if (this.energyCapacity - this.energy) task.push(this.newTask("transfer", {
        resourceType: RESOURCE_ENERGY,
        amount: this.energyCapacity - this.energy
      }));
      if (this.ghodiumCapacity - this.ghodium) task.push(this.newTask("transfer", {
        resourceType: RESOURCE_GHODIUM,
        amount: this.ghodiumCapacity - this.ghodium
      }));
      break;
    case STRUCTURE_LAB:
      // TODO let creepOfScience handle this
      break;
    case STRUCTURE_EXTRACTOR:
      let mineral = this.pos.lookFor(LOOK_MINERALS)[0];
      if (mineral) task.push({
        action: "harvest",
        creepType = "Constructor_s", // TODO write actionToType() in Room
        enthalpy: CREEP_ACTION[action].enthalpy,
        resource: mineral.mineralType,
        target: mineral.simplify,
        time: Game.time,
      });
      break;
    case STRUCTURE_LINK: // No need unless war time
      break;
    case STRUCTURE_OBSERVER: // No need
      break;
    case STRUCTURE_PORTAL: // No need
      break;
    default:
      break;
  }
  return task;
};
/**
 * A helper function for Structure.prototype.generateTask(). It convert creep's method to an object.
 *
 * @param   {string}  action
 * @param   {object}  [resource={}]
 * @param   {string}  [resource.resourceType]
 * @param   {number}  [resource.amount]
 */
Structure.prototype.newTask = function(action, resource) {
  return {
    action,
    creepType = this.home.actionToType(action), // TODO write actionToType() in Room
    enthalpy: CREEP_ACTION[action].enthalpy,
    resource: resource || {},
    target: this.simplify,
    time: Game.time,
  };
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
function preferHighwayAndOwned(roomName, fromRoomName) {
  let roomMemory = Memory.rooms[roomName];
  if (!roomMemory) return 1;
  switch (roomMemory.type) {
    case "hostile":
      return Infinity;
    case "highway":
    case "my":
      return 1;
    default:
      return 1.5;
  }
};

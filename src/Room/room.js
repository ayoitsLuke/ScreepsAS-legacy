"use strict"

import {
  throws
} from "assert";
import {
  error
} from "util";

Object.defineProperties(Room.prototype, {
  global: {
    get: function() {
      if (_.isUndefined(global.rooms) || global.rooms === "undefined") {
        global.rooms = {};
      }
      if (!_.isObject(global.rooms)) {
        return undefined;
      }
      return global.rooms[this.name] = global.rooms[this.name] || {};
    },
    set: function(value) {
      if (_.isUndefined(global.rooms) || global.rooms === "undefined") {
        global.rooms = {};
      }
      if (!_.isObject(global.rooms)) {
        throw new Error("Could not set room global");
      }
      global.rooms[this.name] = value;
    }
  },
  /**
   * Repack
   * @see Room.prototype.type()
   */
  type: {
    get: function() {
      if (!this.memory.type) {
        this.memory.type = this.type();
      }
      return this.memory.type;
    }
  },
  /**
   *
   */
  rcl: {
    get: function() {
      return (this.controller && this.controller.my) ? this.controller.level : 0
    }
  },
  /**
   * @return  {boolean}  Whether this room is my or reserved by me.
   */
  my: {
    get: function() {
      return this.type === "my" || this.type === "reserved"
    }
  },
  /**
   * Assign which OWNED room it belongs to
   * @example remote source/container
   * @return {Room} the home room this object belong to
   */
  home: {
    get: function() {
      // init
      if (!this.memory.homeName) {
        let home = {};
        if (this.type === "my") {
          home = this;
        } else {
          let closest = Infinity;
          const myRooms = Object.values(Game.rooms)
            .filter(r => r.type === "my"); // TODO check
          for (const room in myRooms) {
            const r = Game.map.findRoute(this.name, r.name, {
                routeCallback: roomName => Memory.rooms[roomName] ? Memory.rooms[roomName] === "hostile" ? Infinity : 1 : 1
              })
              .length;
            if (r < closest) {
              closest = r;
              home = room;
            }
          }
        }
        this.memory.homeName = home.name;
      }
      home = Game.rooms[this.memory.homeName];
      if (!home) {
        this.memory.homeName = undefined;
      }
      return room;
    }
  },
  sourceSpace: {
    get: function() {
      if (!this.memory.sourceSpace) {
        this.memory.sourceSpace = this.find(FIND_SOURCES)
          .reduce((totalSpace, s) => totalSpace + s.freeSpaceCount, 0);
      }
      return this.memory.sourceSpace;
    }
  },
  productionPerTick: {
    // enumerable: false,
    // configurable: true,
    get: function() {
      if (!this._productionPerTick) {
        this._productionPerTick = _.sum(this.find(FIND_SOURCES), s => s.productionPerTick);
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
        this.find(FIND_SOURCES)
          .forEach(s => {
            prod += s.productivity;
            sc++;
          });
        this._productivity = prod / sc;
      }
      return this._productivity;
    }
  },
  efficiency: {
    configurable: true,
    get: function() {
      // body...
    }
  },
  refillSpeed: {
    configurable: true,
    get: function() {
      //
    }
  },
  refillData: { // need to rename & fix this monkey coding
    // everytime energyAvailable decrease
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
  }
});
/**
 * Define which types of creep is responsible for which action
 *
 * @param   {[type]}  action  [action description]
 *
 * @return  {[type]}          [return description]
 */
Room.prototype.taskToCreepType = function(task) {
  if (!this.controller || task.creepType) return;
  let creepType;
  switch (this.controller.level) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
      /* TODO
      Worker_s_lc * freeSpace(harvest sources),
      Transporter (move resources),
      Worker_m_hc (upgrade, misc)
      */
      switch (task.action) {
        case "harvest":
          creepType = "Constructor_s_lc";
        case "upgradeController":
          creepType = "Constructor_m_hc";
        case "transfer":
          creepType = "Logistician";
        default:
          creepType = "Constructor_m_hc";
      }
      break;
    case 5:
      /* TODO
      Constructor_m_lc (harvest sources),
      Logistician (move resources),
      Constructor_s_lc (upgrade)
      Constructor_m_hc (misc)
      */
      switch (task.action) {
        case "harvest":
          type = "Constructor_m_lc";
        case "upgradeController":
          type = "Constructor_s_lc";
        case "transfer":
          type = "Logistician";
        default:
          type = "Constructor_m_hc";
      }
      break;
    case 6:
    case 7:
      /* TODO
      Constructor_s_lc: (harvest mineral, upgrade),
      Constructor_m_lc * 1(harvest sources, misc),
      Transporter (move resources, misc),
      */
      if (task.action === "upgradeController" || (task.action === "harvest" && task.resource.resourceType !== energy)) {
        creepType = "Constructor_s_lc";
      } else if (task.action === "transfer") {
        creepType = "Logistician";
      } else {
        creepType = "Constructor_m_hc";
      }
      break;
    case 8:
      /* TODO
      Worker_s_lc * freeSpace (harvest mineral),
      Worker_m_hc * 1 (harvest source, refilling, upgrade, misc),
      */
      if (task.action === "harvest" && task.resource.resourceType !== energy) {
        creepType = "Constructor_m_lc";
      } else {
        creepType = "Constructor_m_hc";
      }
      break;
    default:
      console.error("rcl not exist; Room.taskToCreepType")
      break;
  }
  return creepType;
};
/**
 * [roomType description]
 *
 * @param   {string}  [roomName]  RoomName
 * @return  {string}  The type of this room
 */
Room.prototype.type = function(roomName) {
  roomName = roomName || this.name;
  /**
   * Get room type without visibility (with regex)
   * @author enrico(SlackID: U1Y068C6L)
   * @see https://screeps.slack.com/files/U1Y068C6L/F4AD5JJN7/get_room_type_without_visibility__but_regex___.js
   * @param {string}  roomName  The name of the room you want to know
   * @var  {boolean}  isHighwayRoom
   * @var  {boolean}  isCoreRoom
   * @var  {boolean}  isCenterRoom
   * @var  {boolean}  isSourceKeeperRoom
   * @var  {boolean}  isControllerRoom
   * enrico's snippet starts
   */
  let isHighwayRoom = /^[WE]\d*0[NS]\d*0$/.test(roomName);
  let isCoreRoom = /(^[WE]\d*5[NS]\d*5$)|(^[WE]\d*5[NS]\d*5$)/.test(roomName);
  let isCenterRoom = /^[WE]\d*[4-6]+[NS]\d*[4-6]+$/.test(roomName); // = core room + sk rooms
  let isSourceKeeperRoom = /(^[WE]\d*[4-6][NS]\d*[4|6]$)|(^[WE]\d*[4|6][NS]\d*[4-6]$)/.test(roomName);
  let isControllerRoom = /(^[WE]\d*[1-9]+[NS]\d*[1-3|7-9]+$)|(^[WE]\d*[1-3|7-9]+[NS]\d*[1-9]+$)/.test(roomName);
  // enrico's snippet ends
  if (isHighwayRoom) return this.memory.type = "highway";
  if (isCoreRoom) return this.memory.type = "core";
  if (isSourceKeeperRoom) return this.memory.type = "sourceKeeper";
  if (isControllerRoom) {
    if (this.controller.my) return this.memory.type = "my";
    else if (this.controller.reservation && this.controller.reservation.username === "ayoitsLuke") return this.memory.type = "reserved";
    else if (this.controller.level) return this.memory.type = "hostile";
    else return this.memory.type = "netural";
  }
};

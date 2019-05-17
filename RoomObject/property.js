/** 
 * javascript comment 
 * @Author: flydreame 
 * @Date: 2019-05-16 04:57:17 
 * @Desc:  
 */
Object.defineProperties(RoomObject.prototype, {
  memory: {
    configurable: true,
    get: function() {
      if (_.isUndefined(Memory.roomObjects)) {
        Memory.roomObjects = {};
      }
      if (!_.isObject(Memory.roomObjects)) {
        return undefined;
      }
      return (Memory.roomObjects[this.id] = Memory.roomObjects[this.id] || {});
    },
    set: function(value) {
      if (_.isUndefined(Memory.roomObjects)) {
        Memory.roomObjects = {};
      }
      if (!_.isObject(Memory.roomObjects)) {
        throw new Error("Could not set room object " + this.id + " memory");
      }
      Memory.roomObjects[this.id] = value;
      Memory.roomObjects[this.id].structureType = this.structureType;
    }
  },
  global: {
    configurable: true,
    get: function() {
      if (_.isUndefined(global.roomObjects)) {
        global.roomObjects = {};
      }
      if (!_.isObject(global.roomObjects)) {
        return undefined;
      }
      return (global.roomObjects[this.id] = global.roomObjects[this.id] || {});
    },
    set: function(value) {
      if (_.isUndefined(global.roomObjects)) {
        global.roomObjects = {};
      }
      if (!_.isObject(global.roomObjects)) {
        throw new Error("Could not set room global " + this.id + " memory");
      }
      global.roomObjects[this.id] = value;
      global.roomObjects[this.id].structureType = this.structureType;
    }
  }
});
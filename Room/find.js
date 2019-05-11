"use strict";
// READY
if (!Room.prototype._find) {
  Room.prototype._find = Room.prototype.find;
  /**
   * Find all visible objects and return as an array
   *
   * @method
   * @param  {number} type One of the FIND_* constants.
   * @param  {Object=} opts Inherited from Room.prototype.find()
   * @see https://docs.screeps.com/api/#Room.find
   * @return {Array} an array of all Objects which is visible to player
   * the definition of "visible":
   * @see https://docs.screeps.com/api/#Game.rooms
   */
  Room.prototype.findInAllRooms = function(type, opts) {
    opts = opts || {};
    let result = [];
    if (opts.debug) console.log("-Room.prototype.findInAllRooms");
    filter = opts.filter;
    for (const room of Object.values(Game.rooms)) {
      result.push(...room._find(type, {
        filter
      }));
    }
    if (opts.debug) console.log("all=" + result);
    return result;
  };
  /**
   * Add caching (w/in ticks) and implement claim/random to Room.prototype.find()
   *
   * @method
   * @overwrite
   * @param {number} type One of the FIND_* constants.
   * @param {Object=} opts An object containing following property:
   * e.g. opts = {filter: {...conditions}, claim: true, all: true}
   * PROPERTY IMPLEMENTED (all boolean default FALSE):
   * {cache: string} "deep", "shallow", or undefined. Shallow only cache result for current tick, deep cache last until Global reset. Detail about Global:
   * @see https://docs.screeps.com/contributed/caching-overview.html#Global
   * {claim: str} Ruturn one object & make it unavailable to further searches
   * Setting {claim: true} will force {cache: true}
   * {max: Function | Object | string} Simple impelent of _.max()
   * {min: Function | Object | string} Simple impelent of _.min()
   * Detail: https://lodash.com/docs/3.10.1#max
   * {random: boolean} Return one random object, using Math.random()
   * {all: boolean} Find in all (visible) rooms. More about "visible":
   * https://docs.screeps.com/api/#Game.rooms
   * {filter: Object} Native features. Detail:
   * https://docs.screeps.com/api/#Room.find
   * @return {Array.<Object>} Same as Room.prototype.find(type, [opts])
   * @see https://docs.screeps.com/api/#Room.find
   */
  Room.prototype.find = function(type, opts) {
    // Arguments handling
    opts = opts || {};
    if (opts.debug) console.log("-Room.prototype.find", this.name);
    let result = [];
    let cacheName = type;
    if (typeof opts.cache === "string") opts.cache.toLowerCase();
    opts.cache = opts.claim ? "deep" : opts.cache;
    const methodFind = opts.all ? "findInAllRooms" : "_find";
    if (opts.debug) console.log("type=" + type + " opts" + JSON.stringify(opts))
    if (type === FIND_SOURCES || type === FIND_MINERALS) {
      // Handle stationary harvest vs remote harvest
    }
    if (opts.debug) console.log("cache:" + opts.cache + " random:" + Boolean(opts.random) + " claim:" + Boolean(opts.claim) + " filter:" + JSON.stringify(opts.filter));
    if (!opts.cache) {
      result = this[methodFind](type, opts);
    } else {
      // Generate identifier for cache
      cacheName += opts.filter ? hashCode(opts.filter.toString()
        .replace(/\s+/g, "")) : 0;
      cacheName *= opts.cache === "deep" ? 1 : -1;
      cacheName = opts.all ? cacheName.toString() : this.name + cacheName;
      if (opts.debug) console.log("defining cacheName: ", cacheName)
      /*
      global.find[cacheName] temporary cache, reset each tick
      global.found[cacheName] long-term cache, reset when global reset
       */
      if (!global.found) global.found = {};
      if (!global.find || global.find.timestamp !== Game.time) { // Check the time of temp cache
        global.find = {
          timestamp: Game.time
        };
      };
      if (!global.find[cacheName]) { // If there's no temp cache
        if (!global.found[cacheName] || !global.found[cacheName].length) { // If there's no long-term cache
          global.found[cacheName] = this[methodFind](type, opts)
            .map(o => {
              return {
                id: o.id,
                pos: o.pos
              };
            })
          if (opts.debug) console.log("global.found[cacheName]", global.found[cacheName])
        }
        global.find[cacheName] = global.found[cacheName].map(o => {
          return Game.getObjectById(o.id) || {
            id: o.id,
            pos: new RoomPosition(o.pos.x, o.pos.y, o.pos.roomName)
          };
        })
      }
      if (opts.claim) {
        global.found[cacheName].forEach(o => new RoomVisual(o.pos.roomName)
          .circle(o.pos.x, o.pos.y, {
            color: "#000000"
          }))
        // new RoomVisual(this.name).circle(this.pos.x, this.pos.y, {
        //     color: "#7CFC00"
        // });
      }
      result = global.find[cacheName];
    }
    if (opts.debug) console.log("result=" + result + " opts=" + JSON.stringify(opts))
    // Generate a random position & get the object of that position
    let i = 0;
    if (opts.random) {
      i = ~~(Math.random() * result.length);
      result = result[i];
      if (opts.debug) console.log("random: " + " i=" + i + " result=" + result)
    }
    // DEPRECATED
    if (opts.sort && result.length) {
      result = result.sort(opts.sort);
      if (opts.debug) console.log("resultID" + result.id)
      i = opts.cache ? global.find[cacheName].indexOf(result.id) : 0;
    }
    // Check for maximum or minimum
    if ((opts.max ? 1 : 0) ^ (opts.min ? 1 : 0) && result.length) {
      if (opts.max) {
        result = _.max(result, opts.max);
      }
      if (opts.min) {
        result = _.min(result, opts.min);
      }
      i = opts.cache ? global.find[cacheName].indexOf(result.id) : 0
      if (i < 0) i = 0;
      if (opts.debug) console.log("Max/Min: " + opts.max ? "max" : "min" + result)
      if (typeof result === "number") {
        result = undefined;
        console.log("[ERROR] Room.find() opts.max=" + (opts.max ? opts.max.toString() : "") + " opts.min=" + (opts.min ? opts.min.toString() : "") + " filter=" + (opts.filter ? opts.filter.toString() : "" + " result-" + result))
      }
    }
    // Check for opts: {claim: true}
    if (opts.claim) {
      // Remove the object from cache
      result = global.find[cacheName].splice(i, 1);
      global.found[cacheName].splice(i, 1);
    }
    return Array.isArray(result) ? result : [result];
  }
}
/**
 * This is a method to return the closest object based on priority then distance, null otherwise
 *
 * @method
 * @param  {number | Array.<Object>} type     One of the FIND_* constants OR An array of room's objects or RoomPosition objects.
 * @see https://docs.screeps.com/api/#Room.find
 * @param  {Object=} opts     Inherited from Room.prototype.find(). See JSdoc above for detail
 * PROPERTY IMPLEMENTED (default FALSE):
 * {byPath: boolean} Find closest object by path, otherwise by range
 * {strict: boolean} Strict mode. If false, an random object will be return if no RoomObject matches
 * {...} More native feature.
 * @see https://docs.screeps.com/api/#Room.find
 * @param  {Array.<string>} priority An array of STRUCTURE_* or RESOURCE_* constant.
 * e.g. [STRUCTURE_EXTENSION, STRUCTURE_SPAWN, ...]
 * @return {Object}          The closest object based on priority then range. Or a random object as if type, opts were passed into Room.find()
 */
RoomPosition.prototype.findClosestByPriority = function(type, opts, priority) {
  // Arguments handling
  if (opts.debug) console.log("-RoomPosition.prototype.findClosestByPriority")
  if (Array.isArray(opts) && !priority) {
    priority = opts;
    opts = {};
  }
  opts.claim = opts.random = opts.sort = false; // Idiot prevention (mostly me)
  const methodFindClosestBy = (opts.byPath || opts.all) ? "findClosestByPath" : "findClosestByRange";
  if (opts.debug) console.log("type=" + type + " opts" + JSON.stringify(opts) + " List=" + priority)
  const roomObjects = Game.rooms[this.roomName].find(type, opts);
  if (opts.debug) console.log("roomObjects=", roomObjects)
  if (!roomObjects.length) return;
  // Figuring out whether it's finding structures or resources
  const typeConst = roomObjects[0].resourceType ? "resourceType" : "structureType"
  if (opts.debug) console.log("typeConst=" + typeConst + " typeof=" + typeof typeConst);
  for (const element of priority) { // Loop through priority
    if (roomObjects.some(o => o[typeConst] === element)) {
      // Run filter only if it hit
      const oneType = roomObjects.filter(o => o[typeConst] === element);
      // Return the closest target
      const result = this[methodFindClosestBy](oneType) || this.findClosestByRange(oneType); // PROMLEMATIC
      if (opts.debug) console.log("oneType=" + oneType + " result=" + result);
      return result;
    }
  }
  return opts.strict ? undefined : roomObjects[~~(Math.random() * roomObjects.lengthS)];
};
/**
 * Generate a 32 bit hash from string. Used in Room.find()
 *
 * @see https://stackoverflow.com/a/7616484
 * @method hashCode
 * @param  {string} string The string to turn in hash code
 * @return {number} a hashcode, or 0 if the string is empty
 */
function hashCode(string) {
  let hash = 0,
    i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
/**
 * Find all RoomPositions where fits in a square of fixed sized.
 *
 * @method
 * @param  {number} sideLength the length of the side of the square
 * @return {Array.<RoomPosition>} The top-left corner RoomPosition of all such squares
 */
Room.prototype.findSpaceForSquare = function(sideLength) {
  // The index of `avoid` is the distance at which it should treat the values as obstacles
  // For example, index 2 makes all tiles in radius 2 around the controller "unwalkable"
  let avoid = {
    1: [..._.map(this.find(FIND_SOURCES), s => s.pos), ..._.map(this.find(FIND_MINERALS), s => s.pos)],
    3: [this.controller.pos]
  };
  let grid = new PathFinder.CostMatrix();
  let terrain = this.getTerrain();
  let spots = [];
  let y = 50;
  // Iteration from right to left, bottom to top. ⬅⬅⬆
  while (y--) {
    let x = 50;
    nextPos: while (x--) {
      // Set gird as default (0) if it's a wall
      if (terrain.get(x, y) === TERRAIN_MASK_WALL) {
        continue;
      }
      let pos = new RoomPosition(x, y, this.name);
      // Set gird as default (0) if it's close to an object of avoidance
      for (let r in avoid) {
        let objs = avoid[r];
        if (objs.find(o => o.inRangeTo(pos, r))) {
          // move on to next RoomPosition upon finding object of avoidance
          continue nextPos;
        }
      }
      // The `score` of a tile is the minimum of its right, bottom, and bottom-right tile
      let adj = [grid.get(x + 1, y), grid.get(x, y + 1), grid.get(x + 1, y + 1)];
      let score = Math.min(...adj) + 1;
      grid.set(x, y, score);
      this.visual.text(score, pos);
      if (score >= sideLength) spots.push(pos);
    }
  }
  if (!spots.length) {
    // no spot available
    return false
  }
  return spots;
};
/**
 * [description]
 *
 * @method
 * @param  {RoomPosition} start The start position.
 * @param  {object} goal A goal or goal position.
 * @param  {[type]} roomName [description]
 * @return {object} Same as PathFinder.search().
 * @see https://docs.screeps.com/api/#PathFinder.search
 */

Room.prototype.planRoad = function(start, goal, roomName) {
  // Avoid: minerals, source, existed unwalkable rObj -> set 0xff
  // priorize: existed road/roadConstructSite -> set 1
  // All cost = maintain cost; -> set number based on terrain; > 1
  const plainCost = 1;
  let grid = new PathFinder.CostMatrix();
  if (start.pos) start = start.pos;
  if (goal.pos) goal = goal.pos;
  // set all wall as 150 * plain maintenance cost
  const terrain = Game.map.getRoomTerrain(roomName) || this.getTerrain();
  let y = 50;
  while (y--) {
    let x = 50;
    while (x--) {
      if (terrain.get(x, y) === TERRAIN_MASK_WALL) {
        // console.log("setted")
        grid.set(x, y, CONSTRUCTION_COST_ROAD_WALL_RATIO * plainCost);
      }
    }
  }
  if (!roomName) {
    // set all road/construction site of road as 1.
    [...this.find(FIND_STRUCTURES), ...this.find(FIND_CONSTRUCTION_SITES)].forEach(s => {
      if (s.structureType === STRUCTURE_ROAD) {
        // Favor roads
        grid.set(s.pos.x, s.pos.y, 1);
      } else if (s.structureType !== STRUCTURE_CONTAINER &&
        (s.structureType !== STRUCTURE_RAMPART ||
          !s.my)) {
        // set unwalkable structures
        grid.set(s.pos.x, s.pos.y, 0xff);
      }
    });
    // set sources/mineral as unwalkable
    [...this.find(FIND_SOURCES), ...this.find(FIND_MINERALS)].forEach(o => grid.set(o.pos.x, o.pos.y, 0xff));
  }
  const plannedRoad = PathFinder.search(
    start, goal, {
      roomCallback: () => grid,
      plainCost,
      swampCost: CONSTRUCTION_COST_ROAD_SWAMP_RATIO * plainCost,
      maxRooms: 1
    });
  new RoomVisual(roomName)
    .poly(plannedRoad.path);
  // return plannedRoad;
};


// Game.rooms["W27N41"].planRoad(new RoomPosition(19,9,"W26N44"), new RoomPosition(26,4,"W26N44"),"W26N44");

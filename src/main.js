"use strict";
// defcon: 5 - peace; 4 - hostile in room; 3 - contact; 2 - scount got attack; 1 - nuke incoming
require("require");
//

//
if (!Memory.rooms) Memory.rooms = {};
if (!Memory.creeps) Memory.creeps = {};
/**
 * @var profiler  modules that you use that modify the game "s prototypes should be require'd before you require the profiler. */
const profiler = require("screeps-profiler");
profiler.enable();
module.exports.loop = function() {
  profiler.wrap(() => {
    console.log();
    console.log("-----Tick Starts-----");
    //control.creepNumber.main(); //temp
    //utils.init();
    _.invoke(Game.rooms, "work");
    _.invoke(Game.creeps, "work");

    //market.checkOrders();
    //utils.status();
    console.log("CPU used: " + Game.cpu.getUsed() + " In-game time: " + Game.time);
    if (Game.time % TIMER["gc"] === 0) gc();
    //utils.roomUpdate();
    console.log("-----Tick Ends-----");
  })
}
/**
 * Clear non-existing entitires, garbage collecting
 */
function gc() {
  console.log("Garbage Collecting");
  for (let name in Memory.creeps) {
    if (!Game.creeps[name]) {
      Memory.creeps[name] = undefined;
      console.log('Clearing non-existing creep memory: ', name);
    }
  }
  for (let id in Memory.roomObjects) {
    if (!Game.getObjectById(id)) {
      Memory.roomObjects[id] = undefined;
      console.log('Clearing non-existing room object memory: ', id);
    }
  }
  for (let id in Memory.sources) {
    if (!Game.getObjectById(id)) {
      Memory.sources[id] = undefined;
      console.log('Clearing non-existing source memory: ', id);
    }
  }
  for (let name in Memory.rooms) {
    if (Game.rooms[name] === undefined) {
      // RoomManager.expireRoom(name);
    }
  }
  for (let name in Memory.construction) {
    if (Game.rooms[name] === undefined) {
      Memory.construction[name] = undefined;
      console.log('Clearing non-existing construction memory: ', name);
    }
  }
}
/*
require("room");
require("room.commands");
require("room.properties.misc");
require("room.properties.creeps");
require("room.properties.structures");
require("room.task.process");
require("room.visual");
require("link");
require("terminal");
require("spawn");
require("spawn.strategy.body");
require("spawn.strategy.creep");
require("creep");
require("creep.role");


const market = require("market");
const utils = require("utils");
const profiler = require("profiler");

if (!Memory.intel) Memory.intel = {};
if (!Memory.stats) Memory.stats = {};
if (!Memory.stats.history) Memory.stats.history = [];
if (!Memory.market) Memory.market = {};
if (!Memory.market.sellPriceLimits) Memory.market.sellPriceLimits = {};
if (!Memory.market.buyPriceLimits) Memory.market.buyPriceLimits = {};
if (!Memory.glob) Memory.glob = {};

console.log("Reloaded");
profiler.enable();
module.exports.loop = () => {
    profiler.wrap(() => {
        utils.gc();
        utils.init();
        Object.values(Game.rooms).forEach(room => room.work());
        Object.values(Game.spawns).forEach(spawn => spawn.work());
        Object.values(Game.creeps).forEach(creep => creep.work());
        market.checkOrders();
        utils.status();
    });
}
*/
/*
function willIRecommendThisGameTo(you) {
    if (you.areExperiencedProgrammer || you.knowHowToProgramInJS) {
        return "yes";
    }
}
*/

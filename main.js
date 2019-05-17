"use strict";
// defcon: 5-peace; 4-hostile in room; 3-contact; 2-scount got attack; 1- nuke incoming
// require("othersCodes.render-intel-map.renderIntelMap");
require("othersCodes.Traveler.Traveler");
// require("othersCodes.Cached_dynamic_properties");
// require("othersCodes.get_room_type_without_visibility__but_regex___");
// require("othersCodes.Memory_Cache");
// require("othersCodes.Min-Cut___Wall_-Ramparts_placement_help");
// require("othersCodes.Resource_Colors");
require("othersCodes.Room_prototype_properties_for_all_structure_types");
require("othersCodes.RoomPosition_micro-optimization_methods");
// require("othersCodes.Unicode_directional_arrows");
require("othersCodes.z_console_shortcuts_module");
// require("othersCodes.");
// require("othersCodes.");
// require("othersCodes.");
// require("othersCodes.");
// require("othersCodes.");
//
require("constants");
require("work");
//
require("Creep.action.build");
require("Creep.action.explore");
require("Creep.action.harvest");
require("Creep.action.pickup");
require("Creep.action.recharge");
require("Creep.action.recycle");
require("Creep.action.repair");
require("Creep.action.refill");
require("Creep.action.renew");
require("Creep.action.repair");
require("Creep.action.upgrade");
require("Creep.role");
require("Creep.override");
//
require("Room.statusQuo");
require("Room.find");
require("Room.init");
require("Room.birthControl");
require("Room.property");
require("Room.hud");
//
require("RoomObject.Source");
require("RoomObject.StructureLink");
require("RoomObject.memory");
require("RoomObject.RoomPosition");
require("require");
//
const utils = require("utils");
//
// Any modules that you use that modify the game"s prototypes should be require"d
// before you require the profiler.
const profiler = require("screeps-profiler");
//let init = require("init");
//profiler.enable();
module.exports.loop = function() {
    profiler.wrap(() => {
        console.log();
        console.log("-----Tick Starts-----");
        //control.creepNumber.main(); //temp
        //utils.init();
        _.invoke(Game.rooms, "work");
        _.invoke(Game.creeps, "work");
        /*
                Object.values(Game.rooms).forEach(room => room.work());
                Object.values(Game.spawns).forEach(spawn => spawn.work());
                Object.values(Game.creeps).forEach(creep => creep.work());
                */
        /*
        for (let name in Game.creeps) {
            let creep = Game.creeps[name];
            try {
                creep.work();
            } catch (e) {
                console.log("[ERROR] " + creep.memory.role + ": " + e);
            }
        }
        */
        //market.checkOrders();
        //utils.status();
        console.log("CPU used: " + Game.cpu.getUsed() + " In-game time: " + Game.time);
        if (Game.time % TIMER["gc"] === 0) utils.gc();
        //utils.roomUpdate();
        // console.log("Size of Memory" + roughSizeOfObject(Memory));
        console.log("-----Tick Ends-----");
    })
}

function stub() {
    //cache.main(108)
};

function cache() {
    cached.constructionSites = Game.constructionSites;
    cached.creeps = Game.creeps;
    cached.rooms = Game.rooms;
    cached.droppedResources = new Array();
    for (let r in cache.rooms) {
        console.log(r);
        cached.droppedResources.push(r.find(FIND_DROPPED_RESOURCES));
    }
    cached.structures = Game.structures;
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
function roughSizeOfObject(obj) {
    let objectList = [];
    let stack = [obj];
    let bytes = 0;
    while (stack.length) {
        let value = stack.pop();
        if (typeof value === "boolean") {
            bytes += 4;
        } else if (typeof value === "string") {
            bytes += value.length * 2;
        } else if (typeof value === "number") {
            bytes += 8;
        } else if (typeof value === "object" && objectList.indexOf(value) === -1) {
            objectList.push(value);
            for (let i in value) {
                stack.push(value[i]);
            }
        }
    }
    return bytes;
}
/*
function willIRecommendThisGameTo(you) {
    if (you.areExperiencedProgrammer || you.knowHowToProgramInJS) {
        return "yes";
    }
}
*/

"use strict";
/* Room.prototype.defcon:
DEFCON level-Trigger condition: Defense protocol
5-Peace: One guard per exit; push out into next room's exit area
4-Civilian hostile creeps spotted: Attack only in claimed room;
3-Armed hostile creeps spotted: Military spawning, group, & send to corresponding exit.
2-Hard contact: Add owner to Memory.enemyList, prepare for nuke
1-Nuke incoming: Nuke out; creeps evacuate
*/
Room.prototype.statusQuo = function() {
  // this.productivity;
  this.checkDefcon();
  if (this.find(FIND_HOSTILE_CREEPS, {
      filter: c => c.owner !== "Invader" && c.getActiveBodyparts(HEAL) > 25
    })
    .length) this.controller.activateSafeMode;
}
Room.prototype.checkDefcon = function() {
  if (!this.memory.defcon) this.memory.defcon = 5;
  let currentDefcon = 5;
  if (this.find(FIND_HOSTILE_CREEPS)
    .length) currentDefcon = 4;
  if (this.find(FIND_HOSTILE_CREEPS, {
      filter: c => c.getActiveBodyparts(ATTACK) + c.getActiveBodyparts(RANGED_ATTACK) + c.getActiveBodyparts(HEAL)
    })
    .length) currentDefcon = 3;
  if (this.getEventLog(true)
    .search("EVENT_ATTACK") > -1) currentDefcon = 1;
  if (this.find(FIND_NUKES)
    .length) currentDefcon = 1;
  if (this.memory.defcon < 5 || currentDefcon < 5) {
    if (currentDefcon < this.memory.defcon) this.memory.defcon = currentDefcon
    if (!global.defconDowngradeTime) global.defconDowngradeTime = {};
    if (!global.defconDowngradeTime[this.name]) global.defconDowngradeTime[this.name] = TIMER.defconDowngrade;
    console.log("[" + this.name + "] DEFCON downgrade in " + global.defconDowngradeTime[this.name]);
    if (!--global.defconDowngradeTime[this.name]) {
      global.defconDowngradeTime[this.name] = undefined;
      this.memory.defcon++;
    }
  }
}

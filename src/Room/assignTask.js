
Room.prototype.assignTask = function () {

  const creeps = _.groupBy(Object.values(Game.creeps).filter(c => c.memory.home === this.name), "memory.role");
};

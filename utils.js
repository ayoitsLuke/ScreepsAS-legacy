module.exports = {
    gc: function() {
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

        for (let id in Memory.structures) {
            if (!Game.getObjectById(id)) {
                Memory.structures[id] = undefined;
                console.log('Clearing non-existing structure memory: ', id);
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
    },
};
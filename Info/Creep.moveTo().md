# Creep.moveTo

-> `RoomPosition.findPathTo()`
https://github.com/screeps/engine/blob/3b90d7f3f1318942298ce9d6f0cdee9ee30a9627/src/game/creeps.js#L289

-> `Room.findPath()`
https://github.com/screeps/engine/blob/3b90d7f3f1318942298ce9d6f0cdee9ee30a9627/src/game/rooms.js#L1364

-> local function `_findPath2()`
https://github.com/screeps/engine/blob/3b90d7f3f1318942298ce9d6f0cdee9ee30a9627/src/game/rooms.js#L840

-> `globals.PathFinder.search()`
https://github.com/screeps/engine/blob/3b90d7f3f1318942298ce9d6f0cdee9ee30a9627/src/game/rooms.js#L268

-> `_globals`
https://github.com/screeps/engine/blob/3b90d7f3f1318942298ce9d6f0cdee9ee30a9627/src/game/rooms.js#L381

Because `driver = utils.getRuntimeDriver()`, globals might relate to `driver`. Goto "engine/src/utils" to see what is `getRuntimeDriver()`
https://github.com/screeps/engine/blob/3b90d7f3f1318942298ce9d6f0cdee9ee30a9627/src/game/rooms.js#L3

`utils.getRuntimeDriver()` rediect to "~runtime-driver", use this as keyword search in all screeps repo
https://github.com/screeps/engine/blob/3b90d7f3f1318942298ce9d6f0cdee9ee30a9627/src/utils.js#L35

Found, alias for "./lib/runtime/runtime-driver"
https://github.com/screeps/driver/blob/3b90d7f3f1318942298ce9d6f0cdee9ee30a9627/webpack.config.js#L13

"./lib/runtime/runtime-driver" redirects to `mod`. source code should be in the same repo
https://github.com/screeps/driver/blob/3b90d7f3f1318942298ce9d6f0cdee9ee30a9627/lib/path-finder.js#L133

Source code found:
https://github.com/screeps/driver/blob/master/native/src/main.cc

END

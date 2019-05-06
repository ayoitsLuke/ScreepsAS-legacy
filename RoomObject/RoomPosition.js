/**
 * [description]
 * @method
 * @param  {Object | number} firstArg  [description]
 * @param  {number=} secondArg [description]
 * @return {number}           [description]
 */
RoomPosition.prototype.getRangeTo = function(firstArg, secondArg) {
  let x, y;
  if (firstArg.pos) firstArg = firstArg.pos;
  if (isNaN(firstArg)) {
    const [x1, y1] = roomNameToXY(this.roomName);
    const [x2, y2] = roomNameToXY(firstArg.roomName);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const tdx = firstArg.x + 50 * dx - this.x;
    const tdy = firstArg.y + 50 * dy - this.y;
    return Math.max(Math.abs(tdx), Math.abs(tdy));
  } else {
    return Math.max(Math.abs(this.x - firstArg), Math.abs(this.y - secondArg));
  }
};
/**
 * [roomNameToXY description]
 *
 * @method roomNameToXY
 * @param  {[type]}     name [description]
 * @return {[type]}          [description]
 */
function roomNameToXY(name) {
  const chars = name.toUpperCase().split(/(\d+)/);
  return [chars[0] === "W" ? -chars[1] - 1 : chars[1], chars[2] === "N" ? -chars[3] - 1 : chars[3]];
};
/**
 * Find all RoomPositions where fits in a square of fixed sized.
 *
 * @method
 * @param  {number} sideLength the length of the side of the square
 * @return {Array.<RoomPosition>} The top-left corner RoomPosition of all such squares
 */
Room.prototype.findSpaceForSquare = function(sideLength) {
  let terrain = this.getTerrain();
  let grid = new PathFinder.CostMatrix();
  // The index of `avoid` is the distance at which it should treat the values as obstacles
  // For example, index 2 makes all tiles in radius 2 around the controller "unwalkable"
  let avoid = {
    1: [..._.map(this.find(FIND_SOURCES), s => s.pos), ..._.map(this.find(FIND_MINERALS), s => s.pos)],
    3: [this.controller.pos]
  };
  let spots = [];
  let y = 50;
  // Iteration starts from bottom right ⬅⬅⬆⬆
  while (y--) {
    let x = 50;
    nextPos: while (x--) {
      // CostMatrix (default 0) if it's a wall
      if (terrain.get(x, y) === TERRAIN_MASK_WALL) {
        continue;
      }
      let pos = new RoomPosition(x, y, this.name);
      // CostMatrix (default 0) if it's close to an object of avoidance
      for (let r in avoid) {
        let objs = avoid[r];
        if (objs.find(o => o.inRangeTo(pos, r))) {
          continue nextPos; // goto next RoomPosition
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

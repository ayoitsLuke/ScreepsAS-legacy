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
  const chars = name.toUpperCase()
    .split(/(\d+)/);
  return [chars[0] === "W" ? -chars[1] - 1 : chars[1], chars[2] === "N" ? -chars[3] - 1 : chars[3]];
};

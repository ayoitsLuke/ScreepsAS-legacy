/**
 * [fromObject description]
 * @param   {Object}
 * @return  {RoomPosition}  [return description]
 */
RoomPosition.prototype.fromObject = ({
  x,
  y,
  roomName
}) => new RoomPosition(x, y, roomName);
/**
 * [getTaxicabDistance description]
 *
 * @param   {RoomObject|RoomPosition|number}  firstArg  [firstArg description]
 * @param   {number}  [secondArg]  [secondArg description]
 *
 * @return  {number}  The number of square to the given position in [taxicab metric]{@link http://mathworld.wolfram.com/TaxicabMetric.html}
 */
RoomPosition.prototype.getTaxicabDistanceTo = function(firstArg, secondArg) {
  if (firstArg.pos) firstArg = firstArg.pos;
  if (!isNaN(firstArg) || firstArg.roomName === this.roomName) {
    return this.x - firstArg + this.y - secondArg;
  } else {
    const [xR1, yR1] = Game.map.roomNameToXY(this.roomName);
    const [xR2, yR2] = Game.map.roomNameToXY(firstArg.roomName);
    const dx = 50 * (xR2 - xR1) + firstArg.x - this.x;
    const dy = 50 * (yR2 - yR1) + firstArg.y - this.y;
    return Math.abs(dx) + Math.abs(dy);
  }
};
/**
 * [getRangeTo description]
 * @override  {@link https://docs.screeps.com/api/#RoomPosition.getRangeTo}
 * @param   {RoomObject|RoomPosition|number}  firstArg
 * @param   {number}  [secondArg]  [secondArg description]
 *
 * @return  {number}             [return description]
 */
RoomPosition.prototype.getRangeTo = function(firstArg, secondArg) {
  if (firstArg.pos) firstArg = firstArg.pos;
  if (!isNaN(firstArg) || firstArg.roomName === this.roomName) {
    return Math.max(Math.abs(this.x - firstArg), Math.abs(this.y - secondArg));
  } else {
    const [xR1, yR1] = Game.map.roomNameToXY(this.roomName);
    const [xR2, yR2] = Game.map.roomNameToXY(firstArg.roomName);
    const dx = 50 * (xR2 - xR1) + firstArg.x - this.x;
    const dy = 50 * (yR2 - yR1) + firstArg.y - this.y;
    return Math.max(Math.abs(dx), Math.abs(dy));
  }
};

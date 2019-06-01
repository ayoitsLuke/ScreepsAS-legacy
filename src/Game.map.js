/**
 * @param {string} roomName1
 * @param {string} roomName2
 * @param {boolean} [continuous=false]
 *
 */
Game.map.prototype.getRoomTaxicabDistance = function(roomName1, roomName2, continuous) {
  const [xR1, yR1] = Room.nameToXY(roomName1);
  const [xR2, yR2] = Room.nameToXY(roomName2);
  let dx = Math.abs(xR2 - xR1);
  let dy = Math.abs(yR2 - yR1);
  if (continuous) {
    const worldSize = this.getWorldSize();
    dx = Math.min(worldSize - dx, dx);
    dy = Math.min(worldSize - dy, dy);
  }
  return dx + dy;
};
/**
 * [roomNameToXY description]
 *
 * @param   {[type]}  [name]  [description]
 * @return  {[type]}  [description]
 */
Game.map.prototype.roomNameToXY = function(name) {
  const chars = name.toUpperCase()
    .split(/(\d+)/); // "W99N99" -> ["W", "99", "N", "99", ""]
  return [chars[0] === "W" ? -chars[1] - 1 : chars[1], chars[2] === "N" ? -chars[3] - 1 : chars[3]];
};

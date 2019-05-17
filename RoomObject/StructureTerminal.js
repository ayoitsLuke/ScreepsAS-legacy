/**
 * [description]
 *
 * @method
 * @return {[type]} [description]
 */
StructureTerminal.prototype.work = function () {
  const mineral = this.room.find(FIND_MINERALS)[0].mineralType;
  if (!(Game.time % 100) || !this.memory.orders) this.memory.orders = Game.market.getAllOrders({
    type: ORDER_BUY,
    resourceType: mineral
  });
  const orders = (!(Game.time % 100) || !this.memory.orders) ? this.memory.orders = Game.market.getAllOrders({
    type: ORDER_BUY,
    resourceType: mineral
  }) : this.memory.orders;
  const maxOrder = _.max(orders, o => o.price - 0.02 / o.price * Game.market.calcTransactionCost(Math.min(this.room.terminal.store[mineral], o.amount), this.room.name, o.roomName));
  if (!this.global.maxPrice) this.global.maxPrice = maxOrder.price;
  const amount = Math.min(this.room.terminal.store[mineral], maxOrder.remainingAmount);
  if (this.global.maxPrice < maxOrder.price && this.store[mineral] > 500) {
    this.global.maxPrice = maxOrder.price;
    const errMsg = Game.market.deal(maxOrder.id, amount, this.room.name);
    this.room.visual.text("🤝" + errMsg || amount + " " + mineral, this.pos.x + 1, this.pos.y, {
      align: 'left',
      opacity: 0.5
    });
  }
}

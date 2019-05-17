Object.defineProperties(Creep.prototype, {
  role: {
    configurable: true,
    get: function() {
      if (!this.memory.role) {
        this.memory.role = this.name.substring(0, this.name.indexOf("\n"))
      }
      return this.memory.role;
    },
    set: function(value) {
      this.memory.role = value;
    }
  }

});

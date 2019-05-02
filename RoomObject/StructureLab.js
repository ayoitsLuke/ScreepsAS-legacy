Object.defineProperties(StructureLink.prototype, {
    request: {
        configurable: true,
        get: function() {
            if (!this.memory.belonging) {
                //
            }
            return this.memory.belonging;
        },
        set: function(value) {
            this.memory.belonging = value;
        }
    }
});
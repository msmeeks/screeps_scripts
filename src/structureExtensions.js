
/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('structureExtensions');
 * mod.thing == 'a thing'; // true
 */

var structureExtensions = {
	apply: function() {
		// General Structure extensions
		Structure.prototype.say = function(message) {
            this.room.visual.text(
				message,
                this.pos.x + 1,
                this.pos.y,
                {align: 'left', opacity: 0.8});
		};


		// add structure memory using the room memory as a storage mecahnism
		// TODO: make structure memory a proxy https://stackoverflow.com/questions/6985582/monitor-all-javascript-object-properties-magic-getters-and-setters
		Object.defineProperty(Structure.prototype, 'memory', {
			get: function() {
				return this.room.memory.structuresMemory && this.room.memory.structuresMemory[this.id] || {};
			},
			set: function(value) {
				var structuresMemory = this.room.memory.structuresMemory || {};
				structuresMemory[this.id] = value;
				this.room.memory.structuresMemory = structuresMemory;
			}
		});

		Structure.prototype.addRepairer = function(creep) {
			var memory = this.memory;
			memory.repairers = memory.repairers || [];

			memory.repairers.push(creep.name);

			this.memory = memory;
		};

		Structure.prototype.removeRepairer = function(creep) {
			var memory = this.memory;
			memory.repairers = memory.repairers || [];

			_.remove(memory.repairers, x => x == creep.name);

			this.memory = memory;
		};
	}
};

module.exports = structureExtensions;

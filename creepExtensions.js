/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('creepExtensions');
 * mod.thing == 'a thing'; // true
 */

var creepExtensions = {
	apply: function() {
		Creep.prototype.gatherEnergy = function() {
			var source = this.pos.findClosestByPath(FIND_SOURCES, {filter: (src) => src.energy > 0});
			
			if(this.harvest(source) == ERR_NOT_IN_RANGE) {
				this.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
			}
		};
	}
};

module.exports = creepExtensions;

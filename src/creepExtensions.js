var screepsUtils = require('screepsUtils');

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
			var self = this;
			const target = this.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {filter: x => x.resourceType == RESOURCE_ENERGY && x.room.name == this.room.name});
			if(target) {
				if(this.pickup(target) == ERR_NOT_IN_RANGE) {
					this.moveTo(target);
				}
				return;
			}

			var source = this.pos.findClosestByPath(FIND_SOURCES, {filter: (src) => src.energy > 0});
			
			if(this.harvest(source) == ERR_NOT_IN_RANGE) {
				this.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
			}
		};

		Creep.prototype.getAssignedPos = function() {
			return screepsUtils.roomPositionFromObject(this.memory.assignedPos);
		};

		Creep.prototype.setAssignedPos = function(pos) {
			this.memory.assignedPos = pos;
		};
	}
};

module.exports = creepExtensions;

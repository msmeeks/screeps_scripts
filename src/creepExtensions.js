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

		Creep.prototype.gatherEnergy = function(targetType) {
			var self = this;

			if (!targetType || targetType == FIND_DROPPED_RESOURCES) {
				var droppedTarget = this.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {filter: x => x.resourceType == RESOURCE_ENERGY && x.room.name == this.room.name});
				if(droppedTarget) {
					if(this.pickup(droppedTarget) == ERR_NOT_IN_RANGE) {
						this.moveTo(droppedTarget);
					}
					return true;
				}
			}

			if (!targetType || targetType == FIND_STRUCTURE) {
				var storedTarget = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: x => (x.structureType == STRUCTURE_CONTAINER || x.structureType == STRUCTURE_STORAGE) && x.store[RESOURCE_ENERGY] > 0});

				if(storedTarget) {
					if(this.withdraw(storedTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
						this.moveTo(storedTarget);
					}
					return true;
				}
			}

			if (!targetType || targetType == FIND_SOURCES) {
				var source = this.pos.findClosestByPath(FIND_SOURCES, {filter: (src) => src.energy > 0});

				if(this.harvest(source) == ERR_NOT_IN_RANGE) {
					this.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
				}
				return true;
			}

			return false;
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

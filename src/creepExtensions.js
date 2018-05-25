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

		Creep.prototype.gatherEnergy = function (targetType) {

			var getSupplyType = function (supply) {
				if (supply instanceof Resource) {
					return 'Resource';
				}

				if (supply instanceof Structure) {
					return 'Structure';
				}

				if (supply instanceof Source) {
					return 'Source';
				}

				if (supply instanceof Creep) {
					return 'Creep';
				}

				return undefined;
			};

			var getSupplyPriority = function (supply) {
				switch (getSupplyType(supply)) {
					case 'Resource':
						return 1;
					case 'Structure':
						return 2;
					case 'Source':
						return 3;
					default:
						return 4;
				}
			};

			var getSupplyAmount = function (supply) {
				switch (getSupplyType(supply)) {
					case 'Resource':
						return supply.amount;
					case 'Structure':
						return supply.store[RESOURCE_ENERGY];
					case 'Source':
						return supply.energy;
					default:
						return 0;
				}
			};

			var getSupplyScore = function(creep, target) {
				var distanceFactor = 1000;
				var distanceComponent = distanceFactor * creep.pos.getRangeTo(target);

				var priorityFactor = 1000;
				var priorityComponent = priorityFactor * getSupplyPriority(target);

				var stickinessFactor = 1000;
				var stickinessComponent = stickinessFactor * creep.memory.gatheringTarget == target.id ? 1 : 0;

				var score = -getSupplyAmount(target) + distanceComponent + priorityComponent - stickinessComponent;
				return score;
			};

			var getGatherTarget = function(creep, supplyType) {
				// get all available supplys of energy
				var supplies = [];
				if (!supplyType || supplyType == FIND_DROPPED_RESOURCES) {
					s = creep.room.find(FIND_DROPPED_RESOURCES, {filter: x => x.resourceType == RESOURCE_ENERGY && x.room.name == creep.room.name});
					supplies = supplies.concat(creep.room.find(FIND_DROPPED_RESOURCES, {filter: x => x.resourceType == RESOURCE_ENERGY && x.room.name == creep.room.name}));
				}

				if (!supplyType || supplyType == FIND_STRUCTURES) {
					var s = creep.room.find(FIND_STRUCTURES, {filter: x => (x.structureType == STRUCTURE_CONTAINER || x.structureType == STRUCTURE_STORAGE) && x.store[RESOURCE_ENERGY] > 0});
					supplies = supplies.concat(creep.room.find(FIND_STRUCTURES, {filter: x => (x.structureType == STRUCTURE_CONTAINER || x.structureType == STRUCTURE_STORAGE) && x.store[RESOURCE_ENERGY] > 0}));
				}

				if (!supplyType || supplyType == FIND_SOURCES) {
					var s = creep.room.find(FIND_SOURCES, {filter: (src) => src.energy > 0});
					supplies = supplies.concat(creep.room.find(FIND_SOURCES, {filter: (src) => src.energy > 0}));
				}

				// sort supplies by score
				supplies.sort((a, b) => (getSupplyScore(creep, a) - getSupplyScore(creep, b)));

				return supplies[0];
			};

			var gatherFromSupply = function(creep, supply) {
				switch (getSupplyType(supply)) {
					case 'Resource':
						return creep.pickup(supply);
					case 'Structure':
						return creep.withdraw(supply, RESOURCE_ENERGY);
					case 'Source':
						return creep.harvest(supply);
					default:
						return undefined;
				}
			};

			var target = getGatherTarget(this, targetType);

			this.memory.gatheringTarget = target && target.id;
			
			if (!target) {
				return false;
			}

			var result = gatherFromSupply(this, target);

			if (result == undefined) {
				return false;
			}

			if (result == ERR_NOT_IN_RANGE) {
				this.moveTo(target);
			}

			return true;

		};

		Creep.prototype.getAssignedPos = function() {
			return screepsUtils.roomPositionFromObject(this.memory.assignedPos);
		};

		Creep.prototype.setAssignedPos = function(pos) {
			this.memory.assignedPos = pos;
		};

		Creep.prototype.goToAssignedPos = function() {
			var assignedPos = screepsUtils.roomPositionFromObject(this.memory.assignedPos);
			if (!assignedPos) {
				return false;
			}

			if (!this.pos.isEqualTo(assignedPos)) {
				this.moveTo(assignedPos, {visualizePathStyle: {stroke: '#ffffff'}});
				return true;
			}

			return false;
		}
	}
};

module.exports = creepExtensions;

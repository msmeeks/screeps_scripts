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

			var getGatherTargets = function(creep, supplyType) {
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

				return supplies;
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

			var targets = getGatherTargets(this, targetType);
			
			// There were no valid targets, so return false
			if (!targets) {
				return false;
			}

			var numTargets = targets.length;
			for (var i = 0; i < numTargets; i++) {
				var target = targets[i];

				// try to gather energy from the target
				var result = gatherFromSupply(this, target);

				// if it's not in range
				if (result == ERR_NOT_IN_RANGE) {
					// try to move to the target
					if (this.moveTo(target) == ERR_NO_PATH) {
						// if there is no path, then try the next target
						continue;
					}
				// if it worked, save the target and return true
				} else if (result == OK) {
					this.memory.gatheringTarget = target && target.id;
					return true;
				}
			}
			// there were no reachable supplies with energy, so return false
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

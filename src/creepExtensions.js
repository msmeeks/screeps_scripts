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

        Creep.prototype.BUILD_RANGE = 3;
        Creep.prototype.REPAIR_RANGE = 3;

        Creep.prototype.log = function(msg, shouldLog=true) {
            if (shouldLog) {
                console.log(this + ' ' + msg);
            }
        };

        Creep.prototype.setGatheringTarget = function(target) {
            if (!target) {
                this.memory.gatheringTarget = null;
                return;
            }

            // If the targt hasn't changed, don't do anything
            var oldTarget = this.getGatheringTarget();
            if (oldTarget && oldTarget.id == target.id) {
                return;
            }

        /* TODO: Consider implementing some mecahnism to track gatherers on the supply and score based on that
            // Add this creep to the list of gatherers on the target
            console.log('target: ' + target);
            JSON.stringify('memory: ' + target.memory);
            target.memory.gatherers = target.memory.gatherers || [];
            target.memory.gatherers.push(this.id);
            target.memory = target.memory;

            // Remove this creep from the list of gatherers on the old target
            if (oldTarget) {
                oldTarget.memory.gatherers = oldTarget.memory.gatherers || [];
                _.remove(oldTarget.memory.gatherers, x => x == this.id);
                oldTarget.memory = oldTarget.memory;
            }
        */
            // Set the gathering target for this creep
            this.memory.gatheringTarget = target && target.id;
        };

        Creep.prototype.getGatheringTarget = function() {
            return this.memory.gatheringTarget && Game.getObjectById(this.memory.gatheringTarget);
        };

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

                var amountFactor = 500;
                var amountComponent = 0;
                var amount = getSupplyAmount(target);
                if (amount >= creep.carryCapacity) {
                    amountComponent = 2;
                } else if (amount > 50) {
                    amountComponent = 1;
                }
                amountComponent = amountFactor * amountComponent;

                var score = amountComponent + distanceComponent + priorityComponent;
                return score;
            };

            var isSupplyValid = function(supply) {
                switch (getSupplyType(supply)) {
                    case 'Resource':
                        return supply.resourceType == RESOURCE_ENERGY && getSupplyAmount(supply) > 0;
                    case 'Structure':
                        return (supply.structureType == STRUCTURE_CONTAINER || supply.structureType == STRUCTURE_STORAGE) && getSupplyAmount(supply) > 0;
                    case 'Source':
                        return screepsUtils.sourceHasOpenAccessPoint(supply) && getSupplyAmount(supply) > 0;
                    default:
                        return false;
                }
            };

            var getGatherTarget = function(creep, supplyType) {
                // if the creep already has a gather target and it's still valid, just use that target
                var target = creep.getGatheringTarget();
                if (target && isSupplyValid(target)) {
                    return target;
                } else {
                    creep.setGatheringTarget(null);
                }

                // get all available supplys of energy
                var supplies = [];
                if (!supplyType || supplyType == FIND_DROPPED_RESOURCES) {
                    var s = creep.room.find(FIND_DROPPED_RESOURCES, { filter: isSupplyValid });
                    supplies = supplies.concat(s);
                }

                if (!supplyType || supplyType == FIND_STRUCTURES) {
                    var s = creep.room.find(FIND_STRUCTURES, { filter: isSupplyValid });
                    supplies = supplies.concat(s);
                }

                if ((!supplyType || supplyType == FIND_SOURCES || !supplies) && creep.body.find(p => p.type == WORK)) {
                    var s = creep.room.find(FIND_SOURCES, { filter: isSupplyValid });
                    supplies = supplies.concat(s);
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

            if (!target) {
                return false;
            }

            this.setGatheringTarget(target);
            var result = gatherFromSupply(this, target);

            if (result == undefined) {
                return false;
            }

            if (result == ERR_NOT_IN_RANGE) {
                this.moveTo(target);
            }

            return true;

        };

        /**
         * @return {bool} true if the creep is dropping something this tick
        **/
        Creep.prototype.dropEverything = function() {
            for(const resourceType in this.carry) {
                if (this.drop(resourceType) == OK) {
                    return true;
                }
            }
            return false;
        };

        /**
         * Attempts to transfer all resources the creep is carrying to the target.
         * If the target is undefined or full, then drop the resources instead.
         *
         * @param {Structure|Crrep} target
         * @return {bool} true if the creep is busy transferring or dropping something this tick
        **/
        Creep.prototype.transferEverything = function(target) {
            for(const resourceType in this.carry) {
                if (this.carry[resourceType] == 0) {
                    continue;
                }

                if (!target) {
                    return this.drop(resourceType);
                }

                var result = this.transfer(target, resourceType);

                if(result == ERR_NOT_IN_RANGE) {
                    this.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                } else if (result != OK) {
                    this.drop(resourceType);
                }
                return true;
            }

            return false;
        },

        Creep.prototype.getAssignedPos = function() {
            return screepsUtils.roomPositionFromObject(this.memory.assignedPos);
        };

        Creep.prototype.setAssignedPos = function(pos) {
            this.memory.assignedPos = pos;
        };

        /*
         * @param {RoomPosition} targetPos the position to check
         * @return {bool} true if the creep is at the target position or the position is null, otherwise false
         */
        Creep.prototype.isAtPosition = function(targetPos) {
            if (!targetPos) {
                return true;
            }

            if (!this.pos.isEqualTo(targetPos)) {
                return false;
            }

            return true;
        };

        /*
         * Move to the creep's assigned position, if necessary
         * @returns true if the creep needs to move to get to its assigned position
         */
        Creep.prototype.goToAssignedPos = function() {
            var assignedPos = this.getAssignedPos();
            if (this.isAtPosition(assignedPos)) {
                return false;
            }

            this.moveTo(assignedPos, {visualizePathStyle: {stroke: '#ffffff'}});
            return true;
        }
    }
};

module.exports = creepExtensions;

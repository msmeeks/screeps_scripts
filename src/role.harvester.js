/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.harvester');
 * mod.thing == 'a thing'; // true
 */

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var target = this.getHarvestTarget(creep);
        if(target) {
            if(creep.carry.energy < Math.min(creep.carryCapacity, target.energyCapacity)) {
                creep.gatherEnergy();
            } else {
                this.deliverEnergy(creep, target);
            }
            return true;
        } else {
            return false;
        }
    },

    /**
     * @param {Creep} creep
     * @param {Structure} target
    **/
    deliverEnergy: function(creep, target) {
        if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
        }
    },

    /** @param {Creep} creep **/
    getHarvestTarget: function(creep) {
        // If the creep's role is harvester, prioritize towers
        if (creep.role == 'harvester') {
            var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                }
            });
            if (target) {
                return target;
            }
        }

        var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER) &&
                    structure.energy < structure.energyCapacity;
            }
        });

        return target;
    }
};

module.exports = roleHarvester;

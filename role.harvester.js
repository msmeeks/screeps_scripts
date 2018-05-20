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
        var targets = this.getHarvestTargets(creep);
        if(targets.length > 0) {
            if(creep.carry.energy < creep.carryCapacity) {
                creep.gatherEnergy();
            } else {
                this.deliverEnergy(creep, targets);
            }
            return true;
        } else {
            return false;
        }
    },
    
    /**
     * @param {Creep} creep
     * @param {[Structure]} targets
    **/
    deliverEnergy: function(creep, targets) {
        if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
        }
    },
    
    /** @param {Creep} creep **/
    getHarvestTargets: function(creep) {
        var targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                    structure.energy < structure.energyCapacity;
            }
        });
            
        return targets;
    }
};

module.exports = roleHarvester;

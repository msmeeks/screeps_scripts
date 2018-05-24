/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.miner');
 * mod.thing == 'a thing'; // true
 */

var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.carry.energy < creep.carryCapacity) {
            creep.gatherEnergy(FIND_SOURCES);
        } else {
            this.deliverEnergy(creep);
        }
        return true;
    },

    /**
     * @param {Creep} creep
     * @param {Structure} target
    **/
    deliverEnergy: function(creep) {
        var target = this.getDeliveryTarget(creep);
        if (!target) {
            creep.drop(RESOURCE_ENERGY);
        } else if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
        }
    },

    /** @param {Creep} creep **/
    getDeliveryTarget: function(creep) {
        var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => (
                (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) &&
                _.sum(structure.store) < structure.storeCapacity
            )
        });

        return target;
    }
};

module.exports = roleMiner;

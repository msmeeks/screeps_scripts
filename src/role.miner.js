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
		if (creep.goToAssignedPos()) {
			return true;
		}

        if(creep.carry.energy < creep.carryCapacity) {
			var target = creep.pos.findInRange(FIND_SOURCES, 1)[0];
			var result = creep.harvest(target);
        } else {
            this.depositEnergy(creep);
        }
        return true;
    },

    /**
     * @param {Creep} creep
     * @param {Structure} target
    **/
    depositEnergy: function(creep) {
        var target = this.getDepositTarget(creep);
        if(target && creep.transfer(target, RESOURCE_ENERGY) != OK) {
            creep.drop(RESOURCE_ENERGY);
        }
    },

    /** @param {Creep} creep **/
    getDepositTarget: function(creep) {
        var target = creep.pos.findInRange(FIND_STRUCTURES, 1, {
            filter: (structure) => (
                (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) &&
                _.sum(structure.store) < structure.storeCapacity
            )
        });

        return target[0];
    }
};

module.exports = roleMiner;

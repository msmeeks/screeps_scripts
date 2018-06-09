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
        var target = this.getDeliverTarget(creep);
        if (!target) {
            this.setDeliveringTarget(creep, false);
            return false;
        }

        if(this.getDeliveringTarget(creep) && creep.carry.energy == 0) {
            this.setDeliveringTarget(creep, false);
            creep.setGatheringTarget(null);
            creep.say('🔄 harvest');
        }

        if(!this.getDeliveringTarget(creep) && creep.carry.energy == creep.carryCapacity) {
            this.setDeliveringTarget(creep, target);
            creep.say('🚧 deliver');
        }

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

    setDeliveringTarget: function (creep, target) {
        var targetId = target && target.id;
        creep.memory.delivering = targetId;
    },

    getDeliveringTarget: function (creep) {
        return creep.memory.delivering && Game.getObjectById(creep.memory.delivering);
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
    getDeliverTarget: function(creep) {
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

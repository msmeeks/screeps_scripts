/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.repairer');
 * mod.thing == 'a thing'; // true
 */

var roleRepairer = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.repairing && creep.carry.energy == 0) {
            creep.memory.repairing = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.repairing && creep.carry.energy == creep.carryCapacity) {
            creep.memory.repairing = true;
            creep.say('🚧 repair');
        }

        if(creep.memory.repairing) {
            var target = this.getRepairTarget(creep);
            if(target) {
                this.repair(creep, target);
            } else {
                return false;
            }
        }
        else {
            this.gatherEnergy(creep);
        }
        
        return true;
    },

    /**
     * @param {Creep} creep
     * @param {Structure} target
     **/
    repair: function(creep, target) {
        if(creep.repair(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
        }
    },
    
    /** @param {Creep} creep **/
    gatherEnergy: function(creep) {
        var sources = creep.room.find(FIND_SOURCES);
        
        if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    },

    /** @param {Creep} creep **/
    getRepairTarget: function(creep) {
        return creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: object => object.hits < object.hitsMax});
        /*
        const targets = creep.room.find(FIND_STRUCTURES, {
            filter: object => object.hits < object.hitsMax
        });
        
        targets.sort((a,b) => a.hits - b.hits);
        
        return targets[0];
        */
    }
};

module.exports = roleRepairer;
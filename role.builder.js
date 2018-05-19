/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.builder');
 * mod.thing == 'a thing'; // true
 */

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
            creep.say('🚧 build');
        }

        if(creep.memory.building) {
            var target = this.getBuildTarget(creep);
            if(target) {
                this.build(creep, target);
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
    build: function(creep, target) {
        if(creep.build(target) == ERR_NOT_IN_RANGE) {
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
    getBuildTarget: function(creep) {
        return creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
    }
};

module.exports = roleBuilder;
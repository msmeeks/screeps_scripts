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
		var target = this.getBuildTarget(creep);
		if (!target) {
			creep.memory.building = false
			return false;
		}

        if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
        }

        if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
            creep.say('🚧 build');
        }

        if(creep.memory.building) {
			this.build(creep, target);
        }
        else {
            creep.gatherEnergy();
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
    getBuildTarget: function(creep) {
        return creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
    }
};

module.exports = roleBuilder;

/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.repairer');
 * mod.thing == 'a thing'; // true
 */

var roleRepairer = {

	repairThresholds: {
		0: 500,
		1: 1000,
		2: 5000,
		3: 25000,
		4: 100000,
		5: 1000000,
		6: 10000000,
		7: 50000000,
		8: 100000000
	},

    /** @param {Creep} creep **/
    run: function(creep) {
		var target = this.getRepairTarget(creep);
		if (!target) {
			creep.memory.repairing = false
			return false;
		}

        if(creep.memory.repairing && creep.carry.energy == 0) {
            creep.memory.repairing = false;
            creep.say('🔄 harvest');
        }

        if(!creep.memory.repairing && creep.carry.energy == creep.carryCapacity) {
            creep.memory.repairing = true;
            creep.say('🚧 repair');
        }

        if(creep.memory.repairing) {
			this.repair(creep, target);
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
    repair: function(creep, target) {
        if(creep.repair(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
        }
    },
    
    /** @param {Creep} creep **/
    getRepairTarget: function(creep) {
        //return creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: object => object.hits < object.hitsMax});

        const targets = creep.room.find(FIND_STRUCTURES, {
            filter: object => object.hits < this.getRepairThreshold(creep, object)
        });
        
        targets.sort((a,b) => this.getRepairScore(creep, a) - this.getRepairScore(creep, b));
        
        return targets[0];
    },

	getRepairScore: function(creep, target) {
		var distanceFactor = 100;
		return target.hits + (distanceFactor * creep.pos.getRangeTo(target));
	},

	getRepairThreshold: function(creep, target) {
		if (creep.memory.role == 'repairer') {
			return target.hitsMax;
		} else {
			return Math.min(this.repairThresholds[creep.room.controller.level], target.hitsMax);
		}
	}
};

module.exports = roleRepairer;

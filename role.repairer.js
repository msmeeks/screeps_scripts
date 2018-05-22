var strategyController = require('strategyController');

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
		var target = this.getRepairTarget(creep);
		if (!target) {
			this.setRepairingTarget(creep, null);
			return false;
		}

        if(this.getRepairingTarget(creep) && creep.carry.energy == 0) {
			this.setRepairingTarget(creep, null);
            creep.say('🔄 harvest');
        }

        if(!this.getRepairingTarget(creep) && creep.carry.energy == creep.carryCapacity) {
			this.setRepairingTarget(creep, target);
            creep.say('🚧 repair');
        }

        if(this.getRepairingTarget(creep)) {
			this.repair(creep, target);
        }
        else {
            creep.gatherEnergy();
        }
        
        return true;
    },

	setRepairingTarget: function(creep, target) {
		creep.memory.repairing = target && target.id;
	},

	getRepairingTarget: function (creep) {
		return creep.memory.repairing;
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
        
        targets.sort((a,b) => [
			// sort by repair priority
			//strategyController.compareRepairPriorities(a, b),
			// then by repair score
			(this.getRepairScore(creep, a) - this.getRepairScore(creep, b))
		]);
        
        return targets[0];
    },

	getRepairScore: function(creep, target) {
		var distanceFactor = 100;
		var distanceComponent = distanceFactor * creep.pos.getRangeTo(target);

		var priorityFactor = 10;
		var priorityComponent = priorityFactor * strategyController.getRepairPriority(target);

		// Creeps repair 100 hits per energy, so spend at least 25 energy on a repair job
		// before moving to another otherwise equal job
		var stickinessFactor = 100 * 25;
		var stickinessComponent = stickinessFactor * this.getRepairingTarget(creep) ? 1 : 0;

		return target.hits + distanceComponent + priorityComponent + stickinessComponent;;
	},

	getRepairThreshold: function(creep, target) {
		if (creep.memory.role == 'repairer') {
			return target.hitsMax;
		} else {
			return strategyController.getRepairThreshold(target);
		}
	}
};

module.exports = roleRepairer;

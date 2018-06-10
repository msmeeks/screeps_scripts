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
    selectionStrategies: {
        IN_ROOM: 'IN_ROOM',
        IN_PLACE: 'IN_PLACE',
    },

    /**
    * @param {Creep} creep
    * @param {string} selectionStrategy
    **/
    run: function(creep, selectionStrategy = this.selectionStrategies.IN_ROOM) {
        var target = this.getRepairTarget(creep, selectionStrategy);
        if (!target) {
            this.setRepairingTarget(creep, null);
            return false;
        }

        if(this.getRepairingTarget(creep) && creep.carry.energy == 0) {
            this.setRepairingTarget(creep, null);
            creep.setGatheringTarget(null);
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
        // FIXME: setting the repairer seems to have broken the repair role
        /*
        if (target) {
            target.addRepairer(creep);
        }
        */

        var targetId = target && target.id;

/*
        var oldTarget = this.getRepairingTarget(creep);
        if (oldTarget && oldTarget.id != targetId) {
            oldTarget.removeRepairer(creep);
        }
        */

        creep.memory.repairing = targetId;
    },

    getRepairingTarget: function (creep) {
        return creep.memory.repairing;
        // FIXME: use Game.getObjectById
        return creep.memory.repairing && Game.structures[creep.memory.repairing];
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

    /**
    * @param {Creep} creep
    * @param {string} selectionStrategy
    **/
    getRepairTarget: function(creep, selectionStrategy = this.selectionStrategies.IN_ROOM) {
        selectionStrategy = this.selectionStrategies[selectionStrategy] || this.selectionStrategies.global;
        var targets = [];

        if (selectionStrategy == this.selectionStrategies.IN_PLACE) {
            targets = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, creep.REPAIR_RANGE);
        } else if (selectionStrategy == this.selectionStrategies.IN_ROOM) {
            targets = creep.room.find(FIND_STRUCTURES, {
                filter: object => object.hits < this.getRepairThreshold(creep, object)
            });
        }

        // sort by repair score
        targets.sort((a,b) => (this.getRepairScore(creep, a) - this.getRepairScore(creep, b)));

        return targets[0];
    },

    getRepairScore: function(creep, target) {
        var distanceFactor = 100;
        var distanceComponent = distanceFactor * creep.pos.getRangeTo(target);

        var priorityFactor = 100;
        var priorityComponent = priorityFactor * strategyController.getRepairPriority(target);

        // Creeps repair 100 hits per energy, so spend at least 25 energy on a repair job
        // before moving to another otherwise equal job
        var stickinessFactor = 100 * 25;
        var stickinessComponent = stickinessFactor * this.getRepairingTarget(creep) == target.id ? 1 : 0;

        return target.hits + distanceComponent + priorityComponent - stickinessComponent;;
    },

    getRepairThreshold: function(creep, target) {
        if (creep.memory.role == 'repairer') {
            return target.hitsMax;
        } else {
            // If it's a low priority target, don't repair
            if (strategyController.getRepairPriority(target) > 4) {
                return 0;
            }
            return strategyController.getRepairThreshold(target);
        }
    }
};

module.exports = roleRepairer;

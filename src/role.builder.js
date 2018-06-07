var strategyController = require('strategyController');

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
            this.setBuildingTarget(creep, false);
            return false;
        }

        if(this.getBuildingTarget(creep) && creep.carry.energy == 0) {
            this.setBuildingTarget(creep, false);
            creep.setGatheringTarget(null);
            creep.say('🔄 harvest');
        }

        if(!this.getBuildingTarget(creep) && creep.carry.energy == creep.carryCapacity) {
            this.setBuildingTarget(creep, target);
            creep.say('🚧 build');
        }

        if(this.getBuildingTarget(creep)) {
            this.build(creep, target);
        }
        else {
            creep.gatherEnergy();
        }

        return true;
    },

    setBuildingTarget: function (creep, target) {
        var targetId = target && target.id;
        creep.memory.building = targetId;
    },

    getBuildingTarget: function (creep) {
        return creep.memory.building;
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

    getBuildScore: function(creep, target) {
        var distanceFactor = 100;
        var distanceComponent = distanceFactor * creep.pos.getRangeTo(target);

        var priorityFactor = 100;
        var priorityComponent = priorityFactor * strategyController.getRepairPriority(target);

        var stickinessFactor = 100;
        var stickinessComponent = stickinessFactor * this.getBuildingTarget(creep) == target.id ? 1 : 0;

        var progressRemaining = target.progressTotal - target.progress;

        return progressRemaining + distanceComponent + priorityComponent - stickinessComponent;;
    },

    /** @param {Creep} creep **/
    getBuildTarget: function(creep) {
        // Get build targets from all rooms
        var targets = [];
        for (var roomKey in Game.rooms) {
            var roomTargets = Game.rooms[roomKey].find(FIND_CONSTRUCTION_SITES);
            targets = targets.concat(Game.rooms[roomKey].find(FIND_CONSTRUCTION_SITES));
        }

        // sort by build score
        targets.sort((a,b) => (this.getBuildScore(creep, a) - this.getBuildScore(creep, b)));

        return targets[0];
    }
};

module.exports = roleBuilder;

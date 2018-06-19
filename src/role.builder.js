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
    selectionStrategies: {
        GLOBAL: 'GLOBAL',
        IN_ROOM: 'IN_ROOM',
        IN_PLACE: 'IN_PLACE',
    },

    /**
    * @param {Creep} creep
    * @param {string} selectionStrategy
    **/
    run: function(creep, selectionStrategy = this.selectionStrategies.GLOBAL) {
        var target = this.getBuildTarget(creep, selectionStrategy);
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

    /**
    * @param {Creep} creep
    * @param {string} selectionStrategy
    **/
    getBuildTarget: function(creep, selectionStrategy = this.selectionStrategies.GLOBAL) {
        selectionStrategy = this.selectionStrategies[selectionStrategy] || this.selectionStrategies.global;
        var targets = [];

        if (selectionStrategy == this.selectionStrategies.IN_PLACE) {
            targets = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, creep.BUILD_RANGE);
        } else if (selectionStrategy == this.selectionStrategies.IN_ROOM) {
            // Get build targets from the creep's current room
            targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        } else if (selectionStrategy == this.selectionStrategies.GLOBAL) {
            // Get build targets from all rooms
            for (var roomKey in Game.rooms) {
                var roomTargets = Game.rooms[roomKey].find(FIND_CONSTRUCTION_SITES);
                targets = targets.concat(roomTargets);
            }
        }

        // sort by build score
        targets.sort((a,b) => (this.getBuildScore(creep, a) - this.getBuildScore(creep, b)));

        return targets[0];
    }
};

module.exports = roleBuilder;

var strategyController = require('strategyController');

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
        if (!this.shouldHarvest(creep)) {
            return false;
        }

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
            // If there is a valid target and the creep is not delivering, gather energy
            // This will ensure the creep will fill up before making deliveries
            if(!this.getDeliveringTarget(creep)) {
                creep.gatherEnergy();
            // If there is a valid target and the creep is delivering, deliver
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
        // TODO: Support multiple rooms
        var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER) &&
                    structure.energy < structure.energyCapacity;
            }
        });

        return target;
    },

    /** @param {Creep} creep **/
    shouldHarvest: function(creep) {
        if (creep.memory.role == 'distributor') {
            return true;
        }

        var strategicPriority = strategyController.getStrategicPriority(
            creep.room,
            strategyController.STRATEGIC_PRIORITIES.HARVEST,
            this.calculateStrategicPriority
        );

        return (creep.memory.role == 'harvester' && strategicPriority >= strategyController.STRATEGIC_PRIORITY_MEDIUM) ||
                strategicPriority >= strategyController.STRATEGIC_PRIORITY_HIGH;
    },

    /**
     * Harvest priorities are defined by the following:
     *   HIGH: hostiles present in room and no miner or distributor
     *   MEDIUM: hostiles present in room or no miner or distributor
     *   LOW: no hostiles and miner and distributor
     * @param {Room} room
     * @return {integer} priority level of harvesting for the specified room
     **/
    calculateStrategicPriority: function(room) {
        var hostilesInRoom = strategyController.findHostileCreepsInRoom(room).length > 0;
        var harvestSpecialUnitsInRoom = (
            strategyController.findMyCreepsInRoom(room, {filter: c => c.memory.role == 'miner'}).length > 0 &&
            strategyController.findMyCreepsInRoom(room, {filter: c => c.memory.role == 'distributor'}).length > 0
        );

        if (hostilesInRoom && !harvestSpecialUnitsInRoom) {
            return strategyController.STRATEGIC_PRIORITY_HIGH;
        } else if (hostilesInRoom || !harvestSpecialUnitsInRoom) {
            return strategyController.STRATEGIC_PRIORITY_MEDIUM;
        }
        return strategyController.STRATEGIC_PRIORITY_LOW;
    }
};

module.exports = roleHarvester;

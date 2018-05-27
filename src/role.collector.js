/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.collector');
 * mod.thing == 'a thing'; // true
 */

var roleCollector = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.collectingFrom === undefined) {
            this.assignNextCollectionPoint(creep);
        }

        // if not at assigned pos, go to assigned pos
        if (creep.goToAssignedPos()) {
            return true;
        }

        // clear assigned pos until collection is complete
        creep.setAssignedPos(undefined);

        // if at assigned pos, collect resources
        if (this.collectResources(creep)) {
            return true;
        }

        // if done collecting, deposit at storage
        if (this.deliverEnergy(creep)) {
            // assign next pos
            this.assignNextCollectionPoint(creep);
        }

    },

    assignNextCollectionPoint(creep) {
        var collectionPoints = creep.memory.collectionPoints;
        if (!collectionPoints) {
            console.log('No collection points found for ' + creep);
            return false;
        }

        var collectingFrom = creep.memory.collectingFrom || 0;
        creep.memory.collectingFrom = (collectingFrom + 1) % collectionPoints.length;
        creep.setAssignedPos(collectionPoints[creep.memory.collectingFrom]);
    },

    /**
     * @param {Creep} creep
     * @return {bool} true when the energy has been delivered, false otherwise
    **/
    deliverEnergy: function(creep) {
        var storage = creep.room.find(FIND_STRUCTURES, {
            filter: s => s.structureType == STRUCTURE_STORAGE
        });

        storage = storage && storage[0];
        if (!storage) {
            this.dropEverything(creep);
        }


        var result;
        for(const resourceType in creep.carry) {
            result = creep.transfer(storage, resourceType);
        }

        if(result == ERR_NOT_IN_RANGE) {
            creep.moveTo(storage, {visualizePathStyle: {stroke: '#ffffff'}});
            return false;
        } else if (result != OK) {
            this.dropEverything(creep);
        }
        return true;
    },

    dropEverything: function(creep) {
        for(const resourceType in creep.carry) {
            creep.drop(resourceType);
        }
    },

    /**
     * @param {Creep} creep
     * @return {bool} true if there is something to collect, false if there is nothing to collect or no more space
     **/
    collectResources: function(creep) {
        if (creep.carry.energy >= creep.carryCapacity) {
            return false;
        }

        // TODO: Collect dropped resources
        var target = this.getCollectionTarget(creep);
        if (!target) {
            return false;
        }

        for(const resourceType in target.store) {
            creep.withdraw(target, resourceType);
        }
        return true;
    },

    /** @param {Creep} creep **/
    getCollectionTarget: function(creep) {
        var target = creep.pos.findInRange(FIND_STRUCTURES, 1, {
            filter: s => s.structureType == STRUCTURE_CONTAINER && _.sum(s.store) > 0
        });

        return target[0];
    }
};

module.exports = roleCollector;

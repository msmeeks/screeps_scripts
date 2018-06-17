/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.collector');
 * mod.thing == 'a thing'; // true
 */

var roleCollector = {

    DELIVERY_THRESHOLD: .2,

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.collectingFrom === undefined) {
            return this.assignNextCollectionPoint(creep);
        }

        // if not at assigned pos, go to assigned pos
        if (creep.goToAssignedPos()) {
            return true;
        }

        // if at assigned pos, collect resources
        if (this.collectResources(creep)) {
            return true;
        }

        if (this.deliverResources(creep)) {
            return true;
        }

        return this.assignNextCollectionPoint(creep);
    },

    isAtEndOfRoute: function(creep) {
        var collectionPoints = creep.memory.collectionPoints;
        var collectingFrom = creep.memory.collectingFrom || 0;

        return (collectingFrom + 1) % collectionPoints.length == 0;
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
        creep.goToAssignedPos();
        return true;
    },

    /**
     * @param {Creep} creep
     * @return {bool} true if there is something to collect, false if there is nothing to collect or no more space
     **/
    collectResources: function(creep) {
        // If the creep doesn't have an assigned position or is not at its assigned position, return false
        var assignedPos = creep.getAssignedPos();
        if (!assignedPos || !creep.isAtPosition(assignedPos)) {
            return false;
        }

        var totalAmountCarried = _.sum(creep.carry);

        if (totalAmountCarried >= creep.carryCapacity) {
            return false;
        }

        var target = this.getCollectionTarget(creep);
        if (!target) {
            return false;
        }

        if (target instanceof Resource) {
            creep.pickup(target);
        } else if (target instanceof Structure) {
            for(const resourceType in target.store) {
                creep.withdraw(target, resourceType);
            }
        }

        return true;
    },

    /** @param {Creep} creep **/
    getCollectionTarget: function(creep) {
        var target = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 1)
        if (target && target.length > 0) {
            return target[0];
        }

        target = creep.pos.findInRange(FIND_STRUCTURES, 1, {
            filter: s => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE) && _.sum(s.store) > 0
        });

        return target && target[0];
    },

    /**
     * Attempts to deliver all the resources the creep is carrying to its assigned storage.
     *
     * Will not attempt to deliver resources if the creep is carrying less than the delivery threshold except at the end of the route
     *
     * @param {Creep} creep
     * @return {bool} returns true if the creep is busy delivering resources
     **/
    deliverResources: function(creep) {
        // If the creep is not at the end of the route and is carrying less than the delivery threshold return false
        if (!this.isAtEndOfRoute(creep) && _.sum(creep.carry) < creep.carryCapacity * this.DELIVERY_THRESHOLD) {
            return false;
        }

        // clear assigned position to prevent creep from continuing to collect resources
        creep.setAssignedPos(undefined);

        // go to assigned storage and deposit resources
        var storage = Game.structures[creep.memory.storage];
        return creep.transferEverything(storage);
    }
};

module.exports = roleCollector;

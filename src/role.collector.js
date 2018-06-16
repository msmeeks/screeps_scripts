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

        // if at assigned pos, collect resources
        if (creep.getAssignedPos() && this.collectResources(creep)) {
            return true;
        }

        // if done collecting, clear assigned position and deposit at storage
        creep.setAssignedPos(undefined);

        var storage = Game.structures[creep.memory.storage];
        if (creep.transferEverything(storage)) {
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
     * @return {bool} true if there is something to collect, false if there is nothing to collect or no more space
     **/
    collectResources: function(creep) {
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
    }
};

module.exports = roleCollector;

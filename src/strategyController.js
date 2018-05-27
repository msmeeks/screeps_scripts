/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('strategyController');
 * mod.thing == 'a thing'; // true
 */

var strategyController = (function() {

    var instance;

    function createInstance() {
        return {
            myUsername: 'Ragair',

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

            getRepairThreshold: function(target) {
                return Math.min(instance.repairThresholds[target.room.controller.level], target.hitsMax);
            },

            getRepairPriority: function(target) {
                switch (target.structureType){
                    case STRUCTURE_TOWER:
                        return 1;
                    case STRUCTURE_RAMPART:
                        return 2;
                    case STRUCTURE_SPAWN:
                        return 3;
                    case STRUCTURE_WALL:
                        return 4;
                    case STRUCTURE_EXTENSION:
                        return 5;
                    default:
                        return 6;
                }
            },

            allies: [],

            addAlly: function(username) {
                instance.allies.push(username);
            },

            reomveAlly: function(username) {
                _.remove(instance.allies, x => x == username);
            },

            // Strategic predicates
            isMine: function(target) {

                if (target.my !== undefined) {
                    return target.my;
                }

                if (target.owner !== undefined) {
                    return target.owner == instance.myUsername;
                }

                if (target.username !== undefined) {
                    return target.username == instance.myUsername;
                }

                return (target.room && target.room.controller && target.room.controller.my);
            },

            isAlly: function(target) {
                target = (target.owner && target.owner.username) || target;
                return _.includes(instance.allies, target);
            },

            isHostile: function(target) {
                return !instance.isAlly(target);
            },

            isHurt: function(target) {
                return typeof target == 'Creep'  && target.hits < hitsMax;
            },

            needsRepair: function(target) {
                return target instanceof Structure && target.hits < instance.getRepairThreshold(target);
            },

            // Strategic comparators
            compareDamage: function(a, b) {
                return (a.hitsMax - a.hits) - (b.hitsMax - b.hits);
            },

            compareRepairPriorities: function(a, b) {
                return instance.getRepairPriority(a) - instance.getRepairPriority(b)
            },

            // Find anything helpers
            findUnitsInRange(targetType, source, range, opts) {
                source = source.pos || source;

                if (range === Infinity) {
                    return Game.rooms[source.roomName].find(targetType, opts);
                } else {
                    return source.findInRange(targetType, range, opts);
                }
            },

            findMyUnitsInRange(targetType, source, range, opts) {
                opts = opts || {};
                if (opts.filter !== undefined) {
                    var originalFilter = opts.filter;
                    opts.filter = (x) => originalFilter(x) && instance.isMine(x);
                } else {
                    opts.filter = instance.isMine;
                }

                return instance.findUnitsInRange(targetType, source, range, opts);
            },

            findAlliedUnitsInRange(targetType, source, range, opts) {
                opts = opts || {};
                if (opts.filter !== undefined) {
                    var originalFilter = opts.filter;
                    opts.filter = (x) => originalFilter(x) && instance.isAllied(x);
                } else {
                    opts.filter = instance.isAllied;
                }

                return instance.findUnitsInRange(targetType, source, range, opts);
            },

            findHostileUnitsInRange(targetType, source, range, opts) {
                opts = opts || {};
                if (opts.filter !== undefined) {
                    var originalFilter = opts.filter;
                    opts.filter = (x) => originalFilter(x) && instance.isHostile(x);
                } else {
                    opts.filter = instance.isHostile;
                }

                return instance.findUnitsInRange(targetType, source, range, opts);
            },

            // Find Creeps
            findMyCreepsInRange(source, range, opts) {
                return instance.findUnitsInRange(FIND_MY_CREEPS, source, range, opts);
            },

            findHostileCreepsInRange(source, range, opts) {
                return instance.findHostileUnitsInRange(FIND_HOSTILE_CREEPS, source, range, opts);
            },

            findAlliedCreepsInRange(source, range, opts) {
                return instance.findAlliedUnitsInRange(FIND_HOSTILE_CREEPS, source, range, opts);
            },

            // Find Structures
            findMyStructuresInRange(source, range, opts) {
                return instance.findMyUnitsInRange(FIND_STRUCTURES, source, range, opts);
            },

            findHostileStructuresInRange(source, range, opts) {
                return instance.findHostileUnitsInRange(FIND_HOSTILE_STRUCTURES, source, range, opts);
            },

            findAlliedStructuresInRange(source, range, opts) {
                return instance.findAlliedUnitsInRange(FIND_HOSTILE_STRUCTURES, source, range, opts);
            }
        };
    };

    return {
        getInstance: function() {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

module.exports = strategyController.getInstance();

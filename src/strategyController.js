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
            STRATEGIC_PRIORITY_HIGH: 30,
            STRATEGIC_PRIORITY_MEDIUM: 20,
            STRATEGIC_PRIORITY_LOW: 10,
            STRATEGIC_PRIORITY_TTL: 200,
            STRATEGIC_PRIORITIES: {
                HARVEST: 'harvest',
            },

            myUsername: 'Ragair',

            repairThresholds: {
                0: 500,
                1: 1000,
                2: 5000,
                3: 25000,
                4: 100000,
                5: 250000,
                6: 500000,
                7: 1000000,
                8: 3000000
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
            _addFilterPredicate(opts, predicate) {
                opts = opts || {};
                if (opts.filter !== undefined) {
                    var originalFilter = opts.filter;
                    opts.filter = (x) => originalFilter(x) && predicate(x);
                } else {
                    opts.filter = predicate;
                }

                return opts;
            },

            // Find anything in room helpers
            findUnitsInRoom(targetType, room, opts) {
                return room.find(targetType, opts);
            },

            findMyUnitsInRoom(targetType, room, opts) {
                opts = instance._addFilterPredicate(opts, instance.isMine);

                return instance.findUnitsInRoom(targetType, room, opts);
            },

            findAlliedUnitsInRoom(targetType, room, opts) {
                opts = instance._addFilterPredicate(opts, instance.isAlly);

                return instance.findUnitsInRoom(targetType, room, opts);
            },

            findHostileUnitsInRoom(targetType, room, opts) {
                opts = instance._addFilterPredicate(opts, instance.isHostile);

                return instance.findUnitsInRoom(targetType, room, opts);
            },

            // Find anything in range helpers
            findUnitsInRange(targetType, source, range, opts) {
                source = source.pos || source;

                if (range === Infinity) {
                    return Game.rooms[source.roomName].find(targetType, opts);
                } else {
                    return source.findInRange(targetType, range, opts);
                }
            },

            findMyUnitsInRange(targetType, source, range, opts) {
                opts = instance._addFilterPredicate(opts, instance.isMine);

                return instance.findUnitsInRange(targetType, source, range, opts);
            },

            findAlliedUnitsInRange(targetType, source, range, opts) {
                opts = instance._addFilterPredicate(opts, instance.isAlly);

                return instance.findUnitsInRange(targetType, source, range, opts);
            },

            findHostileUnitsInRange(targetType, source, range, opts) {
                opts = instance._addFilterPredicate(opts, instance.isHostile);

                return instance.findUnitsInRange(targetType, source, range, opts);
            },

            // Find Creeps
            findMyCreepsInRoom(room, opts) {
                return instance.findUnitsInRoom(FIND_MY_CREEPS, room, opts);
            },

            findHostileCreepsInRoom(room, opts) {
                return instance.findHostileUnitsInRoom(FIND_HOSTILE_CREEPS, room, opts);
            },

            findAlliedCreepsInRoom(room, opts) {
                return instance.findAlliedUnitsInRoom(FIND_HOSTILE_CREEPS, room, opts);
            },

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
            findMyStructuresInRoom(room, opts) {
                return instance.findUnitsInRoom(FIND_STRUCTURES, room, opts);
            },

            findHostileStructuresInRoom(room, opts) {
                return instance.findHostileUnitsInRoom(FIND_HOSTILE_STRUCTURES, room, opts);
            },

            findAlliedStructuresInRoom(room, opts) {
                return instance.findAlliedUnitsInRoom(FIND_HOSTILE_STRUCTURES, room, opts);
            },

            findMyStructuresInRange(source, range, opts) {
                return instance.findMyUnitsInRange(FIND_STRUCTURES, source, range, opts);
            },

            findHostileStructuresInRange(source, range, opts) {
                return instance.findHostileUnitsInRange(FIND_HOSTILE_STRUCTURES, source, range, opts);
            },

            findAlliedStructuresInRange(source, range, opts) {
                return instance.findAlliedUnitsInRange(FIND_HOSTILE_STRUCTURES, source, range, opts);
            },

            // Strategic State Helpers
            getStrategicPriority(room, name, doCalculation) {
                var strategicPriorities = room.memory.strategicPriorities || {};
                strategicPriorities[name] = strategicPriorities[name] || { value: undefined, expiresAfterTick: -1 };

                if (strategicPriorities[name].expiresAfterTick < Game.time) {
                    strategicPriorities[name].value = doCalculation(room);
                    strategicPriorities[name].expiresAfterTick = Game.time + instance.STRATEGIC_PRIORITY_TTL;
                    room.memory.strategicPriorities = strategicPriorities;
                }

                return strategicPriorities[name].value
            },
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

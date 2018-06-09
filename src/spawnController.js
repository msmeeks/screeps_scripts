/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('spawnController');
 * mod.thing == 'a thing'; // true
 */

var spawnController = {
    errors: {
        ROLE_UNDEFINED: 1,
        TEMPLATE_UNDEFINED: 2,
        INSUFFICIENT_ENERGY_CAPACITY: 3
    },

    templates: {
        worker: {
            skillLevels: [
                [WORK, CARRY, MOVE, MOVE],
                [WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE],
                [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
            ]
        },

        miner: {
            skillLevels: [
                [WORK, WORK, CARRY, MOVE],
                [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE],
                [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE],
            ]
        },

        transporter: {
            skillLevels: [
                [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE],
                [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
                [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
                [
                    CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                    CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                    MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
                ],
                [
                    CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                    CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                    CARRY, CARRY, CARRY, CARRY,
                    MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                    MOVE, MOVE
                ],
            ]
        },

        guard: {
            skillLevels: [
                [MOVE, ATTACK, ATTACK, ATTACK],
                [TOUGH, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK],
                [TOUGH, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK],
            ]
        },

        claimer: {
            skillLevels: [
                [MOVE, MOVE, CLAIM],
                [MOVE, MOVE, CLAIM, CLAIM],
            ]
        }
    },

    roles: {
        harvester: {
            name: 'harvester',
            minimumCount: 2,
            template: 'worker'
        },
        upgrader: {
            name: 'upgrader',
            minimumCount: 1,
            template: 'worker'
        },
        miner: {
            name: 'miner',
            minimumCount: function(spawn) { return spawn.room.memory.minerPositions && spawn.room.memory.minerPositions.length; },
            template: 'miner'
        },
        collector: {
            name: 'collector',
            minimumCount: 1,
            template: 'transporter',
            memory: function(spawn) {
                var storage = spawn.room.find(FIND_STRUCTURES, { filter: s => s.structureType == STRUCTURE_STORAGE });
                storage = storage && storage[0].id;
                return {collectionPoints: spawn.room.memory.collectionPoints, storage: storage};
            }
        },
        builder: {
            name: 'builder',
            minimumCount: 2,
            template: 'worker'
        },
        repairer: {
            name: 'repairer',
            minimumCount: 1,
            template: 'worker'
        },
        guard: {
            name: 'guard',
            minimumCount: function(spawn) { return spawn.room.memory.guardPositions && spawn.room.memory.guardPositions.length; },
            template: 'guard'
        },
        claimer: {
            name: 'claimer',
            minimumCount: function(spawn) { return spawn.room.memory.claimerPositions && spawn.room.memory.claimerPositions.length; },
            template: 'claimer'
        },
    },

    manageSpawns: function() {
        for (var spawnId in Game.spawns) {
            this.manageSpawn(Game.spawns[spawnId]);
        }
    },

    /** @param {Spawn} spawn **/
    manageSpawn: function(spawn) {
        if(spawn.spawning) {
            var spawningCreep = Game.creeps[spawn.spawning.name];
            spawn.say('🛠️' + spawningCreep.memory.role);
        } else {
            spawn.memory.availableCapacity = spawn.room.energyAvailable;

            var units = _.filter(Game.creeps, (creep) => creep.memory.role == role.name && creep.memory.homeBase == spawn.room.name);

            this.replaceUnits(spawn, units) || this.upgradeUnits(spawn, units);
        }
    },

    /**
    * @param {Spawn} spawn
    * @param {[Creep] units
    **/
    replaceUnits: function(spawn, units) {
        for(var roleKey in this.roles) {
            var role = this.roles[roleKey];

            var minimumCount = role.minimumCount;
            if (typeof role.minimumCount === 'function') {
                minimumCount = role.minimumCount(spawn);
            }

            if (units.length < minimumCount) {
                var result = this.spawnUnit(spawn, role.name);
                if (!result.success) {
                    console.log('Failed to spawn ' + roleKey + '. Error code: ' + result.error);
                } else {
                    return true;
                }
            }
        }
        return false;
    },

    /**
    * @param {Spawn} spawn
    * @param {[Creep] units
    **/
    upgradeUnits: function(spawn, units) {
        for(var roleKey in this.roles) {
            var role = this.roles[roleKey];

            for (var i = 0; i < units.length; i++) {
                var unit = units[i];
                var bodyCost = this.calculateBodyCost(unit.body);
                var upgradeCost = this.calculateBodyCost(this.getSkillsForRole(spawn, role));
                if (bodyCost < upgradeCost && upgradeCost <= spawn.room.energyAvailable) {
                    var result = this.spawnUnit(spawn, role.name);
                    if (!result.success) {
                        console.log('Failed to upgrade ' + roleKey + '. Error code: ' + result.error);
                    }
                    unit.suicide();
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * @param {Spawn} spawn
     * @param {String} role
    **/
    spawnUnit: function(spawn, role) {
        if (this.roles[role] === undefined) {
            return {succes: false, error: this.errors.ROLE_UNDEFINED};
        }

        var skills = this.getSkillsForRole(spawn, this.roles[role]);

        if (!Array.isArray(skills)) {
            return {success: false, error: skills};
        }

        var energyRequired = this.calculateBodyCost(skills);
        // There is not currently enough energy to spawn this unit, so just continue and try again later
        if (energyRequired > spawn.room.energyAvailable) {
            return {success: true};
        }

        var memory = this.roles[role].memory || {};
        if (typeof memory === 'function') {
            memory = memory(spawn);
        }
        memory.role = role;
        memory.homeBase = spawn.room.name;

        var newName = role + '_' + spawn.name + '_' + Game.time;
        console.log('Spawning new ' + role + ': ' + newName);
        spawn.spawnCreep(
            skills,
            newName,
            {memory: memory}
        );

        return {success: true};
    },

    getSkillsForRole: function (spawn, role) {
        var template = role.template;
        return this.getSkillsFromTemplate(spawn, template);
    },

    getSkillsFromTemplate: function (spawn, templateName) {
        var template = this.templates[templateName];
        if (template === undefined) {
            return this.errors.TEMPLATE_UNDEFINED;
        }

        var levels = template.skillLevels;

        for (var i = levels.length-1; i >= 0; i--) {
            var skills = levels[i];
            var energyRequired = this.calculateBodyCost(skills);
            if (spawn.memory.availableCapacity >= energyRequired) {
                return skills;
            }
        }

        return this.errors.INSUFFICIENT_ENERGY_CAPACITY;
    },

    calculateBodyCost: function(parts) {
        return _.reduce(parts, function (cost, part) {
            return cost + BODYPART_COST[part.type || part];
        }, 0);
    }
}

module.exports = spawnController

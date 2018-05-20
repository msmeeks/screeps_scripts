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
				[WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE]
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
        builder: {
            name: 'builder',
            minimumCount: 2,
            template: 'worker'
        },
        repairer: {
            name: 'repairer',
            minimumCount: 1,
            template: 'worker'
        }
    },
    
    /** @param {Spawn} spawn **/
    run: function(spawn) {
        if(spawn.spawning) {
            var spawningCreep = Game.creeps[spawn.spawning.name];
            spawn.room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                spawn.pos.x + 1,
                spawn.pos.y,
                {align: 'left', opacity: 0.8});
        } else {
            this.replaceUnits(spawn) || this.upgradeUnits(spawn);
        }
    },
    
    /** @param {Spawn} spawn **/
    replaceUnits: function(spawn) {
        for(var roleKey in this.roles) {
            var role = this.roles[roleKey];
            var units = _.filter(Game.creeps, (creep) => creep.memory.role == role.name);
            
            if (units.length < role.minimumCount) {
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

    /** @param {Spawn} spawn **/
	upgradeUnits: function(spawn) {
        for(var roleKey in this.roles) {
            var role = this.roles[roleKey];
            var units = _.filter(Game.creeps, (creep) => creep.memory.role == role.name);
            
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

        var newName = role + Game.time;
        console.log('Spawning new ' + role + ': ' + newName);
        spawn.spawnCreep(
            skills,
            newName,
            {memory: {role: role}}
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
			if (spawn.room.energyCapacityAvailable >= energyRequired) {
				return skills;
			}
		}

		return this.errors.INSUFFICIENT_ENERGY_CAPACITY;
	},

	calculateBodyCost: function(parts) {
		return parts.reduce(function (cost, part) {
			return cost + BODYPART_COST[part.type || part];
		}, 0);
	}
}

module.exports = spawnController

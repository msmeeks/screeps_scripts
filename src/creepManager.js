var screepsUtils = require('screepsUtils');

var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleMiner = require('role.miner');
var roleGuard = require('role.guard');

/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('creepManager');
 * mod.thing == 'a thing'; // true
 */

var creepManager = {
	manageCreeps: function() {
		for(var name in Game.creeps) {
			var creep = Game.creeps[name];
			switch (creep.memory.role) {
				case 'harvester':
				case 'builder':
				case 'repairer':
				case 'upgrader':
					this.manageWorker(creep);
					break;
				case 'miner':
					this.manageMiner(creep);
					break;
				case 'guard':
					this.manageGuard(creep);
					break;
				default:
					console.log('Unrecognized role ' + creep.memory.role + ' for creep ' + creep.name);
			}
		}
	},

    /** @param {Creep} creep **/
	manageWorker: function(creep) {
        var engaged = false;
        if(creep.memory.role == 'harvester') {
            engaged = roleHarvester.run(creep);
        }
        if(creep.memory.role == 'builder') {
            engaged = roleBuilder.run(creep);
        }
        if(creep.memory.role == 'repairer') {
            engaged = roleRepairer.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            engaged = roleUpgrader.run(creep);
        }
        
        // If the creep is not engaged in it's role, try other roles in priority order
        engaged = engaged ||
            roleHarvester.run(creep) ||
            roleBuilder.run(creep) ||
            roleRepairer.run(creep) ||
            roleUpgrader.run(creep);

		if(!engaged) {
			console.log(creep.name + ' not engaged');
		}
	},

	assignPosition: function(creep) {
		if (creep.getAssignedPos() === undefined) {
			var positionsKey = creep.memory.role + 'Positions';
			var positions = creep.room.memory[positionsKey];
			if (!positions) {
				return false;
			}

			var unassignedPositions = positions.map(x => screepsUtils.roomPositionFromObject(x));

			var units = _.filter(Game.creeps, (c,x,y) => c.room.id == creep.room.id && c.memory.role == creep.memory.role);
			var numUnits = units.length;

			for (var i = 0; i < numUnits; i++) {
				unassignedPositions = unassignedPositions.filter(pos => !pos.isEqualTo(units[i].getAssignedPos()));
			}
			creep.setAssignedPos(unassignedPositions[0]);
		}
		return true;
	},

    /** @param {Creep} creep **/
	manageGuard: function(creep) {
		this.assignPosition(creep);

		roleGuard.run(creep);
	},

    /** @param {Creep} creep **/
	manageMiner: function(creep) {
		this.assignPosition(creep);

		roleMiner.run(creep);
	}
}

module.exports = creepManager;

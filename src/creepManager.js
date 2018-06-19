var screepsUtils = require('screepsUtils');

var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleMiner = require('role.miner');
var roleCollector = require('role.collector');
var roleGuard = require('role.guard');
var roleClaimer = require('role.claimer');

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
            if (creep.spawning) {
                continue;
            }

            switch (creep.memory.role) {
                case 'harvester':
                case 'builder':
                case 'repairer':
                case 'upgrader':
                    this.manageWorker(creep);
                    break;
                case 'miner':
                case 'guard':
                case 'claimer':
                    this.manageAssignedPositionRoles(creep);
                    break;
                case 'collector':
                    this.manageCollector(creep);
                    break;
                case 'distributor':
                    this.manageDistributor(creep);
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
            engaged = roleBuilder.run(creep, roleBuilder.selectionStrategies.GLOBAL);
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
            roleBuilder.run(creep, roleBuilder.selectionStrategies.IN_ROOM) ||
            roleRepairer.run(creep) ||
            roleUpgrader.run(creep);

        if(!engaged) {
            console.log(creep.name + ' not engaged');
            creep.say('going home');
            creep.moveTo(new RoomPosition(25, 25, creep.memory.homeBase));
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
    manageAssignedPositionRoles: function(creep) {
        this.assignPosition(creep);

        switch (creep.memory.role) {
            case 'miner':
                roleMiner.run(creep);
                break;
            case 'guard':
                roleGuard.run(creep);
                break;
            case 'claimer':
                roleClaimer.run(creep);
                break;
        }
    },

    /** @param {Creep} creep **/
    manageCollector: function(creep) {
        roleCollector.run(creep);
    },

    /** @param {Creep} creep **/
    manageDistributor: function(creep) {
        // if there is no harvesting to do, collect
        roleHarvester.run(creep) || roleCollector.run(creep);
    }
}

module.exports = creepManager;

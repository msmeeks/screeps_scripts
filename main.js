var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var spawnController = require('spawnController');

module.exports.loop = function () {

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    spawnController.run(Game.spawns['Spawn1']);

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
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
        
        // If the creep is not engaged in it's role, try other roles in order
        engaged = engaged ||
            roleHarvester.run(creep) ||
            roleRepairer.run(creep) ||
            roleBuilder.run(creep) ||
            roleUpgrader.run(creep);

        console.log(creep.name + ' not engaged');
    }
}
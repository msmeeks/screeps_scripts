
var spawnController = require('spawnController');
var creepManager = require('creepManager');

var creepExtensions = require('creepExtensions');
creepExtensions.apply();

module.exports.loop = function () {

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    spawnController.manageSpawns();

	creepManager.manageCreeps();
};

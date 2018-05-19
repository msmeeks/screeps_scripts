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
        ROLE_UNDEFINED: -1
    },
    
    roles: {
        harvester: {
            name: 'harvester',
            minimumCount: 2,
            skills: [WORK, CARRY, MOVE]
        },
        upgrader: {
            name: 'upgrader',
            minimumCount: 1,
            skills: [WORK, CARRY, MOVE]
        },
        builder: {
            name: 'builder',
            minimumCount: 2,
            skills: [WORK, CARRY, MOVE]
        },
        repairer: {
            name: 'repairer',
            minimumCount: 1,
            skills: [WORK, CARRY, MOVE]
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
            this.replaceUnits(spawn);
        }
    },
    
    /** @param {Spawn} spawn **/
    replaceUnits: function(spawn) {
        for(var roleKey in this.roles) {
            var role = this.roles[roleKey];
            var units = _.filter(Game.creeps, (creep) => creep.memory.role == role.name);
            
            if (units.length < role.minimumCount) {
                this.spawnUnit(spawn, role.name);
            }
        }
    },
    
    /**
     * @param {Spawn} spawn 
     * @param {String} role
    **/
    spawnUnit: function(spawn, role) {
        if (this.roles[role] === undefined) {
            return this.errors.ROLE_UNDEFINED;
        }
        
        var newName = role + Game.time;
        console.log('Spawning new ' + role + ': ' + newName);
        spawn.spawnCreep(
            this.roles[role].skills,
            newName,
            {memory: {role: role}}
        );
    }
}

module.exports = spawnController
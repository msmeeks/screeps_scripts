var strategyController = require('strategyController');

/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.claimer');
 * mod.thing == 'a thing'; // true
 */

var roleClaimer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // if not at assigned pos, go to assigned pos
        if (creep.goToAssignedPos()) {
            return true;
        }

        var target = creep.pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_CONTROLLER})[0];

        // If it's already mine, log an error and exit
        if (target.my) {
            console.log('Controller assigned to ' + creep + ' already claimed');
            creep.say('Controller already claimed');
            return false;
        }

        // If it's a hostile controller, attack it
        if (target.owner && !strategyController.isMine(target) || target.reservation && !strategyController.isMine(target.reservation)) {
            creep.say('attacking');
            creep.attackController(target);
            return true;
        }

        var result = creep.claimController(target);
        if (result == OK) {
            creep.say('claiming');
        } else if (result == ERR_GCL_NOT_ENOUGH) {
            creep.say('reserving')
            creep.reserveController(target);
        }
        return true;
    },

};

module.exports = roleClaimer;

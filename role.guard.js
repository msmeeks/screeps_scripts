var screepsUtils = require('screepsUtils');
var strategyController = require('strategyController');

/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.guard');
 * mod.thing == 'a thing'; // true
 */

var roleGuard = {

    /** @param {Creep} creep **/
    run: function(creep) {
		var targets = strategyController.findHostileCreepsInRange(creep, 1);

		if (targets.length > 0) {
			creep.attack(targets[0]);
			creep.say('attack');
			return true;
		} else if (!creep.pos.isEqualTo(screepsUtils.roomPositionFromObject(creep.memory.assignedPos))) {
			var assignedPos = screepsUtils.roomPositionFromObject(creep.memory.assignedPos);
			creep.moveTo(assignedPos, {visualizePathStyle: {stroke: '#ffffff'}});
			return true;
		}
		return false;
    }
};

module.exports = roleGuard;

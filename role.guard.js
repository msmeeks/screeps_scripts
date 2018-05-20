var screepsUtils = require('screepsUtils');

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
		var targets = this.getAttackTargets(creep);

		if (targets.length > 0) {
			creep.attack(targets[0]);
		} else if (!creep.pos.isEqualTo(screepsUtils.roomPositionFromObject(creep.memory.assignedPos))) {
			var assignedPos = screepsUtils.roomPositionFromObject(creep.memory.assignedPos);
			creep.moveTo(assignedPos, {visualizePathStyle: {stroke: '#ffffff'}});
		}
    },
    
    /** @param {Creep} creep **/
    getAttackTargets: function(creep) {
		var targets = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 1);

        return targets;
    }
};

module.exports = roleGuard;

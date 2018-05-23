var strategyController = require('strategyController');

/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('towerController');
 * mod.thing == 'a thing'; // true
 */

var towerController = {
	optimalRange: 5,
	effectiveRange: 20,
	maximumRange: Infinity,

	manageTowers: function() {
		var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
		towers.forEach(tower => this.manageTower(tower));
	},

    /** @param {StructureTower} tower **/
	manageTower: function(tower) {
		// if hostiles in optimal attack range, attack them
		this.attackHostileUnitsInRange(tower, this.optimalRange) ||

		// else if my units in optimal heal range are hurt, heal them
		this.healMyCreepsInRange(tower, this.optimalRange) ||

		// else if hostiles in effective attack range, attack them
		this.attackHostileUnitsInRange(tower, this.effectiveRange) ||

		// else if my structures in optimal repair range need repair, repair them
		this.repairMyStructuresInRange(tower, this.optimalRange) ||
		
		// else if my units in effective heal range are hurt, heal them
		this.healMyCreepsInRange(tower, this.effectiveRange) ||

		// else if allies in optimal heal range are hurt, heal them
		this.healAlliedCreepsInRange(tower, this.optimalRange) ||

		// else if hostiles in max attack range, attack them
		this.attackHostileUnitsInRange(tower, this.maximumRange) ||

		// else if my units in max heal range are hurt, heal them
		this.healMyCreepsInRange(tower, this.maximumRange) ||

		// else if allies in effective heal range are hurt, heal them
		this.healAlliedCreepsInRange(tower, this.effectiveRange) ||

		// else if my structures in max repair range need repair, repair them
		this.repairMyStructuresInRange(tower, this.maximumRange);
	},

	attackHostileUnitsInRange: function(tower, range) {
		return false;
		var hostiles = strategyController.findHostileCreepsInRange(tower, range);
		if (hostiles.length > 0) {
			// order by damage
			hostiles.sort(strategyController.compareDamage)
			// attack the most damaged unit
			tower.attack(hostiles[0]);
			tower.say('attack');
			return true;
		}
		return false;
	},

	healMyCreepsInRange: function(tower, range) {
		var myHurtCreeps = strategyController.findMyCreepsInRange(tower, range, {filter: strategyController.isHurt});
		if (myHurtCreeps.length > 0) {
			// order by damage
			myHurtCreeps.sort(strategyController.compareDamage)
			// heal the most damaged unit
			tower.heal(myHurtCreeps[0]);
			tower.say('heal');
			return true;
		}
		return false;
	},

	healAlliedCreepsInRange: function(tower, range) {
		var hurtAlliedCreeps = strategyController.findAlliedCreepsInRange(tower, range, {filter: strategyController.isHurt});
		if (hurtAlliedCreeps.length > 0) {
			// order by damage
			hurtAlliedCreeps.sort(strategyController.compareDamage)
			// heal the most damaged unit
			tower.heal(hurtAlliedCreeps[0]);
			tower.say('heal');
			return true;
		}
		return false;
	},

	repairMyStructuresInRange: function(tower, range) {
		var damagedStructures = strategyController.findMyStructuresInRange(tower, range, {filter: strategyController.needsRepair});
		if (damagedStructures.length > 0) {
			damagedStructures.sort((a, b) => [
				// order by repair priority
				strategyController.compareRepairPriorities(a, b),
				// then by damage
				strategyController.compareDamage(a, b)
			]);

			// repair the highest priority and most damaged structure
			tower.repair(damagedStructures[0]);
			tower.say('repair');
			return true;
		}
		return false;
	}
};

module.exports = towerController;

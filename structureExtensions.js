
/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('structureExtensions');
 * mod.thing == 'a thing'; // true
 */

var structureExtensions = {
	apply: function() {
		Structure.prototype.say = function(message) {
            this.room.visual.text(
				message,
                this.pos.x + 1,
                this.pos.y,
                {align: 'left', opacity: 0.8});
		};
	}
};

module.exports = structureExtensions;

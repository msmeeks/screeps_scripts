/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('screepsUtils');
 * mod.thing == 'a thing'; // true
 */

var screepsUtils = {
	roomPositionFromObject: function(object) {
			if(object === undefined || _.isNaN(object.x) || _.isNaN(object.y) || !_.isString(object.roomName)) {
				return undefined;
			}

			return new RoomPosition(object.x, object.y, object.roomName);
	}
};

module.exports = screepsUtils;

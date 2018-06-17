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
        if(!object || _.isNaN(object.x) || _.isNaN(object.y) || !_.isString(object.roomName)) {
            return undefined;
        }

        return new RoomPosition(object.x, object.y, object.roomName);
    },

    sourceHasOpenAccessPoint: function(source) {

        var getAccessPoints = function(source) {
            var sourceAccessPoints = source.room.memory.sourceAccessPoints || {};
            if (sourceAccessPoints[source.id] === undefined) {
                var neighboringPoints = [
                    new RoomPosition(source.pos.x - 1, source.pos.y + 1, source.pos.roomName),
                    new RoomPosition(source.pos.x, source.pos.y + 1, source.pos.roomName),
                    new RoomPosition(source.pos.x + 1, source.pos.y + 1, source.pos.roomName),
                    new RoomPosition(source.pos.x- 1, source.pos.y, source.pos.roomName),
                    new RoomPosition(source.pos.x + 1, source.pos.y, source.pos.roomName),
                    new RoomPosition(source.pos.x - 1, source.pos.y - 1, source.pos.roomName),
                    new RoomPosition(source.pos.x, source.pos.y - 1, source.pos.roomName),
                    new RoomPosition(source.pos.x + 1, source.pos.y - 1, source.pos.roomName),
                ];

                var isValidAccessPoint = function(pos) {
                    var min = 0;
                    var max = 49;
                    return pos.x >= min && pos.x <= max &&
                           pos.y >= min && pos.y <= max &&
                           Game.map.getTerrainAt(pos) != 'wall';
                };

                sourceAccessPoints[source.id] = _.filter(neighboringPoints, isValidAccessPoint);
                source.room.memory.sourceAccessPoints = sourceAccessPoints;
            }

            return sourceAccessPoints[source.id];
        }; // end getAccessPoints

        var isUnobstructed = function(pos) {
            var objectsAtPos = pos.look();
            var numObjects = objectsAtPos.length;
            for (var j = 0; j < numObjects; j++) {
                if (OBSTACLE_OBJECT_TYPES.includes(objectsAtPos.type)) {
                    return false;
                }
            }
            return true;
        }; // end isUnobstructed

        var accessPoints = getAccessPoints(source);
        var numAccessPoints = accessPoints.length;
        for (var i = 0; i < numAccessPoints; i++) {
            if (isUnobstructed(this.roomPositionFromObject(accessPoints[i]))) {
                return true;
            }
        }
        return false;
    }, // end sourceHasOpenAccessPoint
};

module.exports = screepsUtils;

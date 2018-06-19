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

    /** @param {RoomPosition} pos **/
    getAbsoluteCoordinates: function(pos) {
        var roomWidth = 50;
        var roomParts = pos.roomName.split(/([N,E,S,W])/);
        if (roomParts[1] == 'W') {
            // W is on the negative x-axis from the global origin
            roomParts[2] = -roomParts[2];
            // The room origin is on the wrong side of the x-axis in the negative direction
            pos.x = roomWidth - pos.x;
        }
        var xOffset = (roomParts[2] - 1) * roomWidth;

        if (roomParts[3] == 'S') {
            // S is on the negative y-axis from the global origin
            roomParts[4] = -roomParts[4];
        } else {
            // The room origin is on the wrong side of the y-axis in the positive direction
            pos.y = roomWidth - pos.y;
        }
        var yOffset = (roomParts[4] - 1) * roomWidth;

        return {x: pos.x + xOffset, y: pos.y + yOffset};
    },

    /**
     * @param {object} pos1 A RoomPosition or any object containing a RoomPosition
     * @param {object} pos2 A RoomPosition or any object containing a RoomPosition
     **/
    getRangeAcrossRooms: function(pos1, pos2) {
        var pos1 = this.getAbsoluteCoordinates(pos1.pos || pos1);
        var pos2 = this.getAbsoluteCoordinates(pos2.pos || pos2);

        var deltaX = Math.abs(pos1.x - pos2.x);
        var deltaY = Math.abs(pos1.y - pos2.y);

        // Since creeps can move diagonally, the distance is just the max of the deltas
        return Math.max(deltaX, deltaY);
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

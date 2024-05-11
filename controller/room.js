class RoomController {
    constructor(io) {
        this.io = io
    }

    getRooms = () => {
        const allRooms = this.io.sockets.adapter.rooms;
        const userRooms = []
        allRooms.forEach((value, key) => {
            if (key.startsWith('user_') || key.startsWith('room1')) {
                userRooms.push(key)
            }
        });
        return userRooms
    }
}

module.exports = RoomController
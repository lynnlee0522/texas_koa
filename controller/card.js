class Card {
    constructor() {
        this.card = []
        this.cardTable = []
        this.clientCard = {}
    }

    shuffleArray() {
        this.init();
        let array = Array.from({ length: 52 }, (_, index) => index);
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        this.card = array;
    }

    init() {
        this.card = []
        this.cardTable = []
        this.clientCard = {}
    }

    // 发牌桌
    licensingTable() {
        let removedValues = this.card.splice(0, 3);
        this.cardTable = removedValues
    }

    sprintCard(num) {
        const suit = ['♣️', '♦️', '♠️', '♥️'];
        const number = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
        return suit[num % 4] + number[Math.floor(num / 4)]
    }

    // 发用户牌
    licensing(clients) {
        for (let i = 0; i < clients.length; i++) {
            let removedValues = this.card.splice(0, 2);
            this.clientCard[clients[i]] = removedValues
        }
    }

    turn() {
        let removedValues = this.card.splice(0, 1);
        this.cardTable = [...this.cardTable, ...removedValues]
    }

    river() {
        this.turn()
    }

    // redo
    getClientCard() {
        let newObj = {}
        for (let key in this.clientCard) {
            newObj[key] = this.clientCard[key]?.map(item => this.sprintCard(item))
        }
        return newObj
    }

    getClientCardById(id) {
        return this.clientCard[id]?.map(item => this.sprintCard(item))
    }

    getCardTable() {
        return this.cardTable?.map(item => this.sprintCard(item))
    }

}

// 相当于每个房间的庄家
class CardController {
    constructor(io, roomName) {
        this.card = new Card();
        this.io = io
        this.roomName = roomName;
        this.currentCardType = undefined
    }

    registerEvent = async () => {
        const sockets = await this.io.in(this.roomName).fetchSockets();
        for (const socket of sockets) {
            socket.on('licensingTable', () => this.handleReceiveMessage('licensingTable'))
            socket.on('turn', () => this.handleReceiveMessage('turn'))
            socket.on('river', () => this.handleReceiveMessage('river'))
            socket.on('restart', () => this.handleReceiveMessage('restart'))
        }
    }

    start = () => {
        this.registerEvent();
        this.handleReceiveMessage('licensing')
    }

    restart = () => {
        this.card = new Card();
        this.handleReceiveMessage('licensing')
    }

    handleReceiveMessage = (msgType) => {
        this.currentCardType = msgType;
        switch (msgType) {
            case 'licensing':
                this.licensing();
                break;
            case 'licensingTable':
                this.licensingTable();
                break;
            case 'turn':
                this.turn();
                break;
            case 'river':
                this.river();
                break;
            case 'restart':
                this.restart();
                break;

            default:
                break;
        }
    }

    licensing = async () => {
        // 获取room中所有的socket, 变成一个数组
        this.card.shuffleArray();
        const clients = [...this.io.sockets.adapter.rooms.get(this.roomName)];
        this.card.licensing(clients)
        clients.forEach(clientId => {
            this.io.to(clientId).emit('licensing', this.buildSendMessage(clientId))
        })
    }

    licensingTable = () => {
        this.card.licensingTable()
        this.send('licensingTable', this.buildSendMessage())
    }

    turn = () => {
        this.card.turn()
        this.send('turn', this.buildSendMessage())
    }

    river = () => {
        this.card.river()
        this.send('river', this.buildSendMessage())
    }

    buildSendMessage = (clientId) => {
        if (clientId) {
            return {
                step: this.currentCardType,
                clientCard: this.card.getClientCardById(clientId),
            }
        } else {
            return {
                step: this.currentCardType,
                cardTable: this.card.getCardTable(),
            }
        }

    }

    send = (...args) => {
        this.io.in(this.roomName).emit(...args)
    }
}




module.exports = CardController
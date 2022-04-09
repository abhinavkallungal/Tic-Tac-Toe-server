"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../controllers/index"));
exports.default = {
    connections: (socket) => {
        socket.on('forJoining', (name) => index_1.default.forJoining(name, socket));
        socket.on('gameOptions', (option) => index_1.default.gameOptions(option, socket));
        socket.on('JoinToGame', (roomid) => index_1.default.JoinToGame(roomid, socket));
        socket.on('play', (data) => index_1.default.play(socket, data.position, data.roomid));
        socket.on("spectat", (roomid) => index_1.default.spectat(socket, roomid));
        socket.on("disconnect", () => index_1.default.disconnect(socket));
    }
};

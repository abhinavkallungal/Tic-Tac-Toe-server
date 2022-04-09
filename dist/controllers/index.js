"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db/db"));
const index_1 = __importDefault(require("../helpers/index"));
const app_1 = __importDefault(require("../app"));
exports.default = {
    forJoining: (name, socket) => {
        console.log('forJoining', name);
        if (index_1.default.validateName(name)) {
            db_1.default.users[socket.id] = { name: name };
            index_1.default.sendOptions(socket.id);
        }
        else {
            app_1.default.io.to(socket.id).emit("exit", "name Already exist");
        }
    },
    gameOptions: (option, socket) => {
        if (option == 1) {
            return index_1.default.creareGame(socket);
        }
        if (option == 2) {
            return index_1.default.showAvailableSlot(socket);
        }
        if (option == 3) {
            return index_1.default.showAvailableGame(socket);
        }
        index_1.default.sendOptions(socket.id);
    },
    JoinToGame: (roomid, socket) => {
        if (index_1.default.validateRoomId(roomid) === true) {
            socket.join(roomid);
            db_1.default.users[socket.id].play = roomid;
            let objIndex = db_1.default.play.findIndex((obj) => obj.id == roomid);
            app_1.default.io.to(socket.id).emit("joinid", roomid);
            db_1.default.play[objIndex].players.push(socket.id);
            let firstPlayer = db_1.default.play[objIndex].players[0];
            let secondPlayer = db_1.default.play[objIndex].players[1];
            let message = "Game started: \n" +
                " 1 | 2 | 3 \n" +
                " --------- \n" +
                " 4 | 5 | 6 \n" +
                " --------- \n" +
                " 7 | 8 | 9 \n";
            app_1.default.io.to(firstPlayer).emit("someonejoined");
            app_1.default.io.to(roomid).emit("message", message);
            app_1.default.io.to(firstPlayer).emit("turn", "its your  turn enter a number in between 1- 9");
            app_1.default.io.to(secondPlayer).emit("message", `your oponent ${db_1.default.users[firstPlayer].name} is playing`);
        }
        else {
            app_1.default.io.to(socket.id).emit("exit", index_1.default.validateRoomId(roomid) || "invalied id");
        }
    },
    play: (socket, position, roomid) => {
        console.log(position, roomid);
        let room = db_1.default.play.filter((room) => room.id == roomid);
        let playerIndex = room[0].players.findIndex((playerid) => playerid == socket.id);
        let player;
        if (playerIndex === 0) {
            player = 'firstPlayer';
        }
        else {
            player = 'secondPlayer';
        }
        if (index_1.default.validateMove(position, room[0]) === true) {
            index_1.default.markBoard(position, player, room[0]);
            index_1.default.printBoard(roomid, room[0], socket);
            if (index_1.default.checkWin(player, room[0]) === true) {
                console.log('Winner Winner!');
                app_1.default.io.to(socket.id).emit('successMessage', 'Winner Winner!');
                app_1.default.io.to(room[0].id).emit('successMessage', ` ${db_1.default.users[socket.id].name} Winner this game`);
                index_1.default.sendOptions(room[0].id);
                return;
            }
            if (index_1.default.checkTie(room[0]) === true) {
                app_1.default.io.to(room[0].id).emit('warningMessage', 'Tie Game');
                console.log('Tie Game');
                return;
            }
            if (player === "firstPlayer") {
                index_1.default.playTurn('secondPlayer', roomid);
            }
            else {
                index_1.default.playTurn('firstPlayer', roomid);
            }
        }
        else {
            console.log('');
            index_1.default.playTurn(player, roomid);
        }
    },
    spectat: (socket, roomid) => {
        if (index_1.default.validateRoomIdForSpectat(roomid)) {
            app_1.default.io.to(roomid).emit('successMessage', '\n' + "==== some one spectat Your Game ====" + '\n');
            app_1.default.io.to(socket.id).emit('successMessage', '\n' + "==== Start To Spectat the Game ====" + '\n');
            socket.join(roomid);
        }
        else {
            app_1.default.io.to(socket.id).emit('dangerMessage', '\n' + "Invalied Id" + '\n');
            index_1.default.sendOptions(socket.id);
        }
    },
    disconnect: (socket) => {
        let user = db_1.default.users[socket.id];
        if (!(user === null || user === void 0 ? void 0 : user.play))
            return delete db_1.default.users[socket.id];
        let roomid = user.play;
        if (roomid) {
            let room = db_1.default.play.find((item) => item.id == roomid);
            app_1.default.io.to(roomid).emit("warningMessage", "your oponent was left start new game");
            index_1.default.sendOptions(roomid);
            if (room.players.length === 1 || room.players.length === 2) {
                db_1.default.play = db_1.default.play.filter((item) => item.id !== roomid);
            }
            delete db_1.default.users[socket.id];
        }
        console.log('disconnected', socket.id);
    }
};

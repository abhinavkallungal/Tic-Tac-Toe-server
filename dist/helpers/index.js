"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db/db"));
const app_1 = __importDefault(require("../app"));
const uuid_1 = require("uuid");
let isInt = (value) => {
    let x;
    if (isNaN(value)) {
        return false;
    }
    x = parseFloat(value);
    return (x | 0) === x;
};
var winCombinations = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [1, 5, 9],
    [3, 5, 7],
];
exports.default = {
    validateName: (name) => {
        let userIndex = Object.values(db_1.default.users).findIndex((item) => item.name === name);
        if (userIndex === -1 || Object.values(db_1.default.users).length === 0) {
            return true;
        }
        return false;
    },
    creareGame: (socket) => {
        if (db_1.default.play.length > 10)
            return app_1.default.io
                .to(socket.id)
                .emit("exit", " all servers are busy! retry Again");
        var board = {
            1: " ",
            2: " ",
            3: " ",
            4: " ",
            5: " ",
            6: " ",
            7: " ",
            8: " ",
            9: " ",
        };
        let id = (0, uuid_1.v4)();
        socket.join(id);
        db_1.default.play.push({ id: id, players: [socket.id], board: board });
        db_1.default.users[socket.id].play = id;
        app_1.default.io
            .to(socket.id)
            .emit("successMessage", "\n" + "==== Successfully created the Room ==== " + "\n");
        app_1.default.io
            .to(socket.id)
            .emit("game_created", {
            message: "\n" + "waiting for  opponent  to join " + "\n",
            id: id,
        });
    },
    showAvailableSlot: (socket) => {
        let slots = [];
        db_1.default.play.map((item) => {
            if (item.players.length == 1) {
                slots.push(item.id);
            }
        });
        if (slots.length === 0) {
            app_1.default.io.to(socket.id).emit("warningMessage", "\n" + " No Game Room are Avaliable Create a New Room" + "\n");
            let message = " Connect To the server . What would like to do john_doe (choose an Option) : \n" +
                "1 . Create a new Game \n" +
                "2 . Join Game \n" +
                "3 . spectate a  Game \n";
            app_1.default.io.to(socket.id).emit("ChooseAnOption", message);
            return false;
        }
        app_1.default.io
            .to(socket.id)
            .emit("showAvailableSlot", "\n" + "Avaliable game Room are :" + "\n" + slots);
    },
    showAvailableGame: (socket) => {
        let slots = [];
        db_1.default.play.map((item) => {
            if (item.players.length == 2)
                return slots.push(item.id);
        });
        if (slots.length == 0) {
            app_1.default.io.to(socket.id).emit("warningMessage", "\n" + " No Game Room are Avaliable for Spectat Create a New Room" + "\n");
            let message = " Connect To the server . What would like to do john_doe (choose an Option) : \n" +
                "1 . Create a new Game \n" +
                "2 . Join Game \n" +
                "3 . spectate a  Game \n";
            app_1.default.io.to(socket.id).emit("ChooseAnOption", message);
            return false;
        }
        app_1.default.io.to(socket.id).emit("spectat", slots);
    },
    validateRoomId: (id) => {
        let roomIndex = db_1.default.play.findIndex((item) => item.id === id);
        if (roomIndex !== -1 && db_1.default.play[roomIndex].players.length === 1) {
            return true;
        }
        if (roomIndex !== -1 && db_1.default.play[roomIndex].players.length === 2) {
            return "some one join the room";
        }
        return false;
    },
    validateMove: (position, room) => {
        return (isInt(position) &&
            room.board[position] === " " &&
            position < 10 &&
            position > 0);
    },
    markBoard: (position, user, room) => {
        let mark = "O";
        if (user == "firstPlayer") {
            mark = "X";
        }
        room.board[position] = mark.toUpperCase();
    },
    printBoard: (roomid, room, socket) => {
        let message = "\n" +
            db_1.default.users[socket.id].name +
            " Played" +
            "\n" +
            " " +
            room.board[1] +
            " | " +
            room.board[2] +
            " | " +
            room.board[3] +
            "\n" +
            " ---------\n" +
            " " +
            room.board[4] +
            " | " +
            room.board[5] +
            " | " +
            room.board[6] +
            "\n" +
            " ---------\n" +
            " " +
            room.board[7] +
            " | " +
            room.board[8] +
            " | " +
            room.board[9] +
            "\n";
        app_1.default.io.to(roomid).emit("message", message);
    },
    checkWin: (player, room) => {
        let mark = "O";
        if (player == "firstPlayer") {
            mark = "X";
        }
        var i, j, markCount;
        for (i = 0; i < winCombinations.length; i++) {
            markCount = 0;
            for (j = 0; j < winCombinations[i].length; j++) {
                if (room.board[winCombinations[i][j]] == mark.toUpperCase()) {
                    markCount++;
                }
                if (markCount === 3) {
                    db_1.default.play = db_1.default.play.filter((item) => item.id !== room.id);
                    return true;
                }
            }
        }
        return false;
    },
    checkTie: (room) => {
        for (var i = 1; i <= Object.keys(room.board).length; i++) {
            if (room.board[i] === " ") {
                return false;
            }
        }
        return true;
    },
    playTurn: (player, roomid) => {
        console.log("playTurn");
        let room = db_1.default.play.filter((room) => room.id === roomid);
        let firstPlayer = room[0].players[0];
        let secondPlayer = room[0].players[1];
        if (player === "firstPlayer") {
            app_1.default.io
                .to(firstPlayer)
                .emit("turn", "its your  turn enter a number in between 1- 9");
            app_1.default.io
                .to(secondPlayer)
                .emit("message", `your oponent ${db_1.default.users[firstPlayer].name} is playing`);
        }
        else {
            app_1.default.io
                .to(secondPlayer)
                .emit("turn", "its your  turn enter a number in between 1- 9");
            app_1.default.io
                .to(firstPlayer)
                .emit("message", `your oponent ${db_1.default.users[secondPlayer].name} is playing`);
        }
    },
    sendOptions: (id) => {
        let message = " Connect To the server . What would like to do john_doe (choose an Option) : \n" +
            "1 . Create a new Game \n" +
            "2 . Join Game \n" +
            "3 . spectate a  Game \n";
        app_1.default.io.to(id).emit("ChooseAnOption", message);
    },
    validateRoomIdForSpectat: (roomid) => {
        let roomIndex = db_1.default.play.findIndex((item) => item.id === roomid);
        if (roomIndex !== -1 && db_1.default.play[roomIndex].players.length === 2) {
            return true;
        }
        return false;
    },
};

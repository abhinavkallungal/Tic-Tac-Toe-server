import db from "../db/db";
import app from "../app";
import { v4 as uuidv4 } from "uuid";


let isInt = (value: any) => {
  let x: number;
  if (isNaN(value)) {
    return false;
  }
  x = parseFloat(value);
  return (x | 0) === x;
};


var winCombinations = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [1, 4, 7],
[2, 5, 8], [3, 6, 9], [1, 5, 9], [3, 5, 7]];



export default {
  validateName: (name: string): boolean => {
    let userIndex: number = Object.values(db.users).findIndex(
      (item: any): boolean => item.name === name
    );

    if (userIndex === -1 || Object.values(db.users).length === 0) {
      return true;
    }
    return false;
  },

  creareGame: (socket: any) => {
    if (db.play.length > 10)
      return app.io
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

    let id = uuidv4();
    socket.join(id);
    db.play.push({ id: id, players: [socket.id], board: board });

    db.users[socket.id].play = id;

    app.io.to(socket.id).emit("successMessage",'\n'+"==== Successfully created the Room ==== "+'\n')

    app.io
      .to(socket.id)
      .emit("game_created", { message: '\n'+"waiting for  opponent  to join "+'\n', id: id });
  },

  showAvailableSlot: (socket: any) => {
    let slots: string[] = [];
    db.play.map((item) => {
      if (item.players.length == 1) {
        slots.push(item.id);
      }
    });

    if(slots.length===0) {
        app.io.to(socket.id).emit("warningMessage", '\n'+' No Game Room are Avaliable Create a New Room'+'\n');

        let message: string =
        " Connect To the server . What would like to do john_doe (choose an Option) : \n" +
        "1 . Create a new Game \n" +
        "2 . Join Game \n" +
        "3 . spectate a  Game \n";

      app.io.to(socket.id).emit("ChooseAnOption", message);
      
      return false

       

    }

    app.io.to(socket.id).emit("showAvailableSlot", '\n'+'Avaliable game Room are :'+'\n'+slots);
  },

  showAvailableGame: (socket: any) => {
    let slots: string[] = [];

    db.play.map((item) => {
      if (item.players.length == 2) return slots.push(item.id);
    });

    app.io.to(socket.id).emit("spectat", slots);
  },

  validateRoomId: (id: string) => {
    let roomIndex = db.play.findIndex((item) => item.id === id);

    if (roomIndex !== -1 && db.play[roomIndex].players.length === 1) {
      return true;
    }

    if (roomIndex !== -1 && db.play[roomIndex].players.length === 2) {
        return "some one join the room";
      }
    return false;
  },

  validateMove: (position: number, room: { board: any }) => {
    return (
      isInt(position) &&
      room.board[position] === " " &&
      position < 10 &&
      position > 0
    );
  },

  markBoard: (position: number, user: string, room: any) => {
    let mark = "O";

    if (user == "firstPlayer") {
      mark = "X";
    }

    room.board[position] = mark.toUpperCase();
  },

   printBoard:(roomid:string,room:any,socket:any)=> {
    let message ='\n' + db.users[socket.id].name +" Played"  + '\n' +
        ' ' + room.board[1] + ' | ' + room.board[2] + ' | ' + room.board[3] + '\n' +
        ' ---------\n' +
        ' ' + room.board[4] + ' | ' + room.board[5] + ' | ' + room.board[6] + '\n' +
        ' ---------\n' +
        ' ' + room.board[7] + ' | ' + room.board[8] + ' | ' + room.board[9] + '\n'

        app.io.to(roomid).emit('message', message)
    },

     checkWin:(player:string, room:any)=>{

        let  mark = "O"
    
        if(player == "firstPlayer"){
           mark = "X"
        }
    
        var i, j, markCount
        for (i = 0; i < winCombinations.length; i++) {
            markCount = 0;
            for (j = 0; j < winCombinations[i].length; j++) {
                if (room.board[winCombinations[i][j]] == mark.toUpperCase()) {
                    markCount++;
                }
                if (markCount === 3) {
                    return true;
                }
            }
        }
        return false;
    },
     checkTie:(room:any)=> {
        for (var i = 1; i <= Object.keys(room.board).length; i++) {
            if (room.board[i] === ' ') {
                return false;
            }
        }
        return true;
    },
     playTurn:(player:string, roomid:string)=> {

        console.log("playTurn");
        

        let room = db.play.filter((room) => room.id === roomid)
        let firstPlayer = room[0].players[0]
        let secondPlayer = room[0].players[1]
    
        if (player === 'firstPlayer') {
    
            app.io.to(firstPlayer).emit("turn", "its your  turn enter a number in between 1- 9")
            app.io.to(secondPlayer).emit("message", `your oponent ${db.users[firstPlayer].name} is playing`)
        } else {
            app.io.to(secondPlayer).emit("turn", "its your  turn enter a number in between 1- 9")
            app.io.to(firstPlayer).emit("message", `your oponent ${db.users[secondPlayer].name} is playing`)
    
    
        }
    
    
    
    },
    sendOptions: (id:string)=>{
       
        
        let message: string =
        " Connect To the server . What would like to do john_doe (choose an Option) : \n" +
        "1 . Create a new Game \n" +
        "2 . Join Game \n" +
        "3 . spectate a  Game \n";

      app.io.to(id).emit("ChooseAnOption", message);
    }
    
};



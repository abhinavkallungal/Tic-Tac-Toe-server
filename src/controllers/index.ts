import db from "../db/db";
import helpers from "../helpers/index";
import app from "../app";


export default {
  forJoining: (name: string, socket: any) => {
      console.log('forJoining',name);
      
    if (helpers.validateName(name)) {
      db.users[socket.id] = { name: name };

  

      helpers.sendOptions(socket.id)

    } else {
      app.io.to(socket.id).emit("exit", "name Already exist");
    }
  },
  gameOptions: (option: string | number, socket: any) => {
    if (option == 1) {
      return helpers.creareGame(socket);
    }
    if (option == 2) {
      return helpers.showAvailableSlot(socket);
    }
    if (option == 3) {
      return helpers.showAvailableGame(socket);
    }

    helpers.sendOptions(socket.id)

  },

  JoinToGame: ( roomid: string,socket: any) => {

    if (helpers.validateRoomId(roomid) === true) {

      socket.join(roomid);

      db.users[socket.id].play = roomid;

      let objIndex :number = db.play.findIndex((obj) => obj.id == roomid);

      app.io.to(socket.id).emit("joinid", roomid);

      db.play[objIndex].players.push(socket.id);

      let firstPlayer = db.play[objIndex].players[0];

      let secondPlayer = db.play[objIndex].players[1];

      let message =
        "Game started: \n" +
        " 1 | 2 | 3 \n" +
        " --------- \n" +
        " 4 | 5 | 6 \n" +
        " --------- \n" +
        " 7 | 8 | 9 \n";

      app.io.to(firstPlayer).emit("someonejoined");

      app.io.to(roomid).emit("message", message);

      app.io.to(firstPlayer).emit(
        "turn",
        "its your  turn enter a number in between 1- 9"
      );
      app.io.to(secondPlayer).emit(
        "message",
        `your oponent ${db.users[firstPlayer].name} is playing`
      );
    } else {

      app.io.to(socket.id).emit("exit", helpers.validateRoomId(roomid) || "invalied id");
    }
  },

  
 play:(socket:any, position:number, roomid:string)=> {

    let room = db.play.filter((room) => room.id == roomid)

    let playerIndex = room[0].players.findIndex((playerid: any) => playerid == socket.id)

    let player

    if (playerIndex === 0) {
        player = 'firstPlayer'
    } else {
        player = 'secondPlayer'
    }





    if (helpers.validateMove(position, room[0]) === true) {
       helpers.markBoard(position, player, room[0]);
        helpers.printBoard(roomid, room[0],socket);
        if (helpers.checkWin(player, room[0]) === true) {
            console.log('Winner Winner!');

            app.io.to(socket.id).emit('successMessage', 'Winner Winner!')
            app.io.to(room[0].id).emit('successMessage', ` ${db.users[socket.id].name} Winner this game`)
            helpers.sendOptions(room[0].id)
            return;
        }
        if (helpers.checkTie(room[0]) === true) {
            app.io.to(room[0].id).emit('warningMessage', 'Tie Game')
            console.log('Tie Game');
            return;
        }

        if (player === "firstPlayer") {
            helpers.playTurn('secondPlayer', roomid);
        } else {
            helpers.playTurn('firstPlayer', roomid);
        }

    } else {
        console.log('');



        helpers.playTurn(player, roomid);

    }


},
    spectat:(socket:any,roomid:string,)=>{

        app.io.to(roomid).emit('successMessage','\n'+"==== some one spectat Your Game ===="+'\n' )
        
        app.io.to(socket.id).emit('successMessage','\n'+"==== Start To Spectat the Game ===="+'\n' )

        socket.join(roomid) 
        

    },

    disconnect:(socket:any) => {


        let user:any= db.users[socket.id];

        if(!user.play) return  delete db.users[socket.id];

        let roomid = user.play

        

        let room :any= db.play.find((item)=> item.id == roomid)

        


        app.io.to(roomid).emit("warningMessage","your oponent was left start new game")

        helpers.sendOptions(roomid)

        if(room.players.length === 1 || room.players.length === 2) {
              db.play = db.play.filter((item)=> item.id !== roomid)
        }


        delete db.users[socket.id];


        console.log('disconnected', socket.id)
    }
};

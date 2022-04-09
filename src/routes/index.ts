
import controller from "../controllers/index"



export default{
   
    connections:(socket: any) =>{
       

        socket.on('forJoining',(name:string)=>controller.forJoining(name,socket))
     
        socket.on('gameOptions',(option:string|number)=>controller.gameOptions(option,socket))

        socket.on('JoinToGame',(roomid:string)=>controller.JoinToGame(roomid,socket))

        socket.on('play',(data:any)=>controller.play(socket,data.position,data.roomid))

        socket.on("spectat", (roomid:string) =>controller.spectat(socket,roomid))

        socket.on("disconnect", () =>controller.disconnect(socket))

    }

}
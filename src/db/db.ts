interface play{
    id:string,
    players:string[],
    board:object
}

let users:any = {};
let play:play[] = [];

export default {
    users:users,
    play:play,
}
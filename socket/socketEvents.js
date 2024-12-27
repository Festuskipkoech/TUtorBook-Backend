const Message = require('../models/message')

const socketEvents =(io) =>{
    io.on("Connection", (socket) =>{
        console.log("New Client connected")
        
        socket.on("join_room", (room) =>{
            socket.join(room);
            console.log(`User ${socket.id} joined room ${room}`);
        });
        socket.on("send_message", async (data) =>{
            const { text, sender, room} = data;
            const message = await Message.create({ text, sender, room});
            io.to(room).emit("receive_message", message)

        });
        socket.on("signal", (data) =>{
            const { to, signal} = data;
            io.to(to).emit("signal", {from:socket.id, signal});
        });
        socket.on("disconnect", () =>{
            console.log("Client Disconnected")
        });
    });
};
module.exports = {socketEvents};
module.exports = function(io){
    io.on('connection', (socket) =>{
        console.log("A user connected:" + socket.id);

        // handle signaling messages for video call
        socket.on('offer', (data) =>{
            io.to(data.target).emit('offer', data);
        });
        socket.on('answer', (data) =>{
            io.to(data.target).emit('answer', data)
        });
        socket.on('ice-candidate', (data) =>{
            io.to(data.target).emit('ice-candidate', data)
        });

        // Disconnect the user
        socket.on('disconnect', () =>{
            console.log("A user disconnected")
        });
        

    })
}
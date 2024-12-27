const mongoose= require('mongoose');

const messageSchema=new mongoose.Schema({
    text:String,
    sender:String,
    room:String,
    createdAt: { type:Date, default:Date.Now, expires:3600} //Expires after  1 hr

});
 const Message=mongoose.model("Message", messageSchema);
 module.exports =Message;
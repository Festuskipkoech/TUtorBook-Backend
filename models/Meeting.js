import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
    meetingId: {type:String, required:true, unique:true},
    hostEmail:{type: String, required:true},
    participants:[{
        email:String,
        socketId:String,
        joinedAt:Date
    }],
    createdAt: { type:Date, default:Date.now},
    active: { type:Boolean, default: true}
});
export default mongoose.model('Meeting', meetingSchema)
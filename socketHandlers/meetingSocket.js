import Meeting from "../models/Meeting.js";
const handleSockets = (io) => {
  io.on('connection', (socket) => {
    socket.on('join-meeting', async ({ meetingId, email }) => {
      try {
        const meeting = await Meeting.findOne({ meetingId, active: true });

        if (!meeting) {
          socket.emit('error', { message: 'Meeting not found' });
          return;
        }

        if (meeting.participants.some(p => p.email === email)) {
          socket.emit('error', { message: 'User already in meeting' });
          return;
        }

        meeting.participants.push({
          email,
          socketId: socket.id,
          joinedAt: new Date()
        });
        await meeting.save();

        socket.join(meetingId);
        socket.to(meetingId).emit('user-joined', { email });

        socket.emit('meeting-users', {
          users: meeting.participants.map(p => ({
            email: p.email,
            socketId: p.socketId
          }))
        });
      } catch (error) {
        socket.emit('error', { message: 'Error joining meeting' });
      }
    });

    socket.on('signal', ({ to, signal }) => {
      io.to(to).emit('signal', { from: socket.id, signal });
    });

    socket.on('start-sharing', ({ meetingId }) => {
      socket.to(meetingId).emit('user-sharing', { socketId: socket.id });
    });

    socket.on('stop-sharing', ({ meetingId }) => {
      socket.to(meetingId).emit('user-stopped-sharing', { socketId: socket.id });
    });

    socket.on('leave-meeting', async ({ meetingId, email }) => {
      try {
        const meeting = await Meeting.findOne({ meetingId });
        if (meeting) {
          meeting.participants = meeting.participants.filter(
            p => p.email !== email
          );
          await meeting.save();

          socket.to(meetingId).emit('user-left', { email });
          socket.leave(meetingId);
        }
      } catch (error) {
        socket.emit('error', { message: 'Error leaving meeting' });
      }
    });

    socket.on('disconnect', async () => {
      try {
        const meeting = await Meeting.findOne({
          'participants.socketId': socket.id
        });

        if (meeting) {
          const participant = meeting.participants.find(
            p => p.socketId === socket.id
          );

          meeting.participants = meeting.participants.filter(
            p => p.socketId !== socket.id
          );
          await meeting.save();

          socket.to(meeting.meetingId).emit('user-left', {
            email: participant.email
          });
        }
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  });
};
export default handleSockets;


const { GroupMessage, User } = require('../models');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join peer direct chat room
    socket.on('join_peer_chat', ({ connectionId }) => {
      socket.join(`peer_${connectionId}`);
      console.log(`[Socket.IO] Socket ${socket.id} joined peer_${connectionId}`);
    });

    // Send direct message
    socket.on('send_peer_message', ({ connectionId, senderId, senderName, message }) => {
      const payload = {
        connectionId,
        senderId,
        senderName,
        message,
        timestamp: new Date().toISOString(),
      };
      io.to(`peer_${connectionId}`).emit('receive_peer_message', payload);
    });

    // Join study group room
    socket.on('join_study_group', ({ groupId }) => {
      socket.join(`group_${groupId}`);
      console.log(`[Socket.IO] Socket ${socket.id} joined group_${groupId}`);
    });

    // Send study group message
    socket.on('send_group_message', async ({ groupId, senderId, senderName, content }) => {
      try {
        const msg = await GroupMessage.create({
          group: groupId,
          sender: senderId,
          senderName: senderName || 'Fellow Learner',
          content,
        });

        io.to(`group_${groupId}`).emit('receive_group_message', {
          _id: msg._id,
          group: groupId,
          sender: senderId,
          senderName: msg.senderName,
          content: msg.content,
          createdAt: msg.createdAt,
        });
      } catch (err) {
        console.error('[Socket Error] Saving group message failed:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
};

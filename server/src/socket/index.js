import jwt from "jsonwebtoken";

// In-memory map: userId -> socketId (last active tab wins for notifications)
const userSocketMap = new Map();

function initSocket(io) {
  io.on("connection", (socket) => {
    // Client joins a drop-specific room to receive targeted stock + activity events
    socket.on("join:drop", ({ dropId }) => {
      if (dropId) socket.join(`drop:${dropId}`);
    });

    socket.on("leave:drop", ({ dropId }) => {
      if (dropId) socket.leave(`drop:${dropId}`);
    });

    // After login the client sends its JWT so we can link userId -> socketId
    // for targeted reservation:expired notifications
    socket.on("authenticate", ({ token }) => {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        socket.data.userId = payload.id;
        userSocketMap.set(payload.id, socket.id);
      } catch {
        // invalid token — ignore silently
      }
    });

    socket.on("disconnect", () => {
      if (socket.data.userId) {
        // Only remove if this socket is still the current one for this user
        if (userSocketMap.get(socket.data.userId) === socket.id) {
          userSocketMap.delete(socket.data.userId);
        }
      }
    });
  });
}

export { initSocket, userSocketMap };

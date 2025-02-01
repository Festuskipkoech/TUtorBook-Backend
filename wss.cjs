const WebSocket = require('ws');
const crypto = require('crypto'); // For generating unique meeting links

const init = (port) => {
    console.log("WebSocket server initialized");
    const wss = new WebSocket.Server({ 
        port,
        host:'0.0.0.0',
        handleProtocols: () => 'echo-protocol', // Add protocol handling
        perMessageDeflate: {
            zlibDeflateOptions: {
                chunkSize: 1024,
                memLevel: 7,
                level: 3
            },
            zlibInflateOptions: {
                chunkSize: 10 * 1024
            }
        }
     });

    wss.on("connection", (socket) => {
    // console.log('Connection established from:', req.socket.remoteAddress);

        socket.on('error', console.error);
        socket.on('message', (message) => onMessage(wss, socket, message));
        socket.on('close', (message) => onClose(wss, socket, message));
    });
};

const channels = {};

const send = (wsClient, type, body) => {
    wsClient.send(JSON.stringify({ type, body }));
};

const onMessage = (wss, socket, message) => {
    const parsedMessage = JSON.parse(message);
    const { type, body } = parsedMessage;
    const { channelName, userName } = body || {};

    switch (type) {
        case 'join': {
            if (!channels[channelName]) {
                channels[channelName] = {};
            }
            channels[channelName][userName] = socket;
            const userNames = Object.keys(channels[channelName]);
            send(socket, 'joined', userNames);
            break;
        }
        case 'quit': {
            if (channels[channelName]) {
                delete channels[channelName][userName];
                if (!Object.keys(channels[channelName]).length) {
                    delete channels[channelName];
                }
            }
            break;
        }
        case 'generate_meeting_link': {
            const meetingLink = `https://meet.tutorbook.com/${crypto.randomUUID()}`;
            send(socket, 'meeting_link_generated', { meetingLink });
            break;
        }
        default:
            console.log(`Unhandled message type: ${type}`);
            break;
    }
};

const onClose = (wss, socket, message) => {
    console.log("onClose", message);
    Object.keys(channels).forEach((cname) => {
        Object.keys(channels[cname]).forEach((uid) => {
            if (channels[cname][uid] === socket) {
                delete channels[cname][uid];
            }
        });
    });
};

export default { init };

const bot = require(__dirname + '/lib/smd')
const { VERSION } = require(__dirname + '/config')

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');

const makeWASocket = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

const startBot = async () => {
    const socket = makeWASocket();
    
    socket.ev.on('connection.update', (update) => {
        const { qr } = update;
        if (qr) {
            // Log the QR code as base64
            const qrBase64 = Buffer.from(qr).toString('base64');
            console.log("QR Code in Base64:", qrBase64);
            
            // Display QR code in the terminal as usual
            qrcode.generate(qr, { small: true });
        }
    });

    // Additional bot logic here
};

startBot();

const start = async () => {
    Debug.info(`Hitdev ${VERSION}`)
  try {
    await bot.init()
    bot.logger.info('⏳ Database syncing!')
    await bot.DATABASE.sync()
    await bot.connect()
  } catch (error) {
    Debug.error(error);
    start();
  }
}
start();

const bot = require(__dirname + '/lib/smd')
const { VERSION } = require(__dirname + '/config')

const { default: makeWASocket } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
console.log("This script runs");
const startBot = async () => {
    const socket = makeWASocket();

    socket.ev.on('connection.update', (update) => {
        const { qr, connection } = update;
        if (connection === 'close') {
            console.log("Connection closed. Attempting to reconnect...");
            startBot(); // Attempt to reconnect
        }

        if (qr) {
            // Log the raw QR code data for debugging
            console.log("Raw QR Code Data:", qr);

            // Display QR code in the terminal
            console.clear(); // Clear previous logs for clarity
            console.log("Scan this QR code:");
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

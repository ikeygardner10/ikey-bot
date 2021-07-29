/* eslint-disable no-unused-vars */
const { Discord, Client, Intents } = require('discord.js');
const fs = require('fs-extra');
const Enmap = require('enmap');
global.Promise = require('bluebird');
const client = new Client({
	ws: { intents: Intents.ALL },
	disableMentions: 'none',
	sync: true,
	cloneLevel: 'deep',
});

client.config = require('./data/owner/config.json');

const mysql = require('mysql2');
client.conPool = mysql.createPool({
	connectionLimit: 25,
	multipleStatements: true,
	host: 'localhost',
	user: 'ikeybot',
	password: client.config.mySQLpw,
	database: 'ikeybot',
	charset: 'utf8mb4',
	Promise: global.Promise,
});

const logger = require('./functions/logger.js')('./logs/logs.txt');
const chalk = require('chalk');
logger.setFormat('{date}/{month}/{year} {hour}:{minute}:{second}');
logger.theme.log = chalk.white;
logger.theme.debug = chalk.blue;
logger.theme.info = chalk.cyan;
logger.theme.alert = chalk.magenta;
logger.theme.warn = chalk.yellow;
logger.theme.error = chalk.red;
logger.theme.success = chalk.green;

const buildImageArray = require('./functions/buildImageArray.js');
buildImageArray.execute(client);

fs.readdir('./events/', (error, files) => {
	if(error) return console.error(`[CLIENT] ${error.stack}`);
	files.forEach(file => {
		if(!file.endsWith('.js')) return;
		const event = require(`./events/${file}`);
		const eventName = file.split('.')[0];
		client.on(eventName, event.bind(null, client));
		delete require.cache[require.resolve(`./events/${file}`)];
	});
});

client.prefixes = new Enmap();
client.commands = new Enmap();
client.aliases = new Enmap();

fs.readdir('./commands/', (error, folders) => {
	if(error) return console.error(`[CLIENT] ${error.stack}`);
	folders.forEach(folder => {
		fs.readdir(`./commands/${folder}/`, (err, files) => {
			if(err) return console.error(`[CLIENT] ${err.stack}`);
			files.forEach(file => {
				if (!file.endsWith('.js')) return;
				const props = require(`./commands/${folder}/${file}`);
				const commandName = file.split('.')[0];
				console.info(`Loading command: ${commandName}`);
				client.commands.set(props.config.name, props);
				props.config.aliases.forEach(alias => {
					client.aliases.set(alias, props.config.name);
				});
			});
		});
	});
});

process.on('unhandledRejection', async (error) => {
	console.error(`[CLIENT] ${error.stack}`);
	if(error.path) {
		client.channels.cache.get('784192991492702218').send(`__***ERROR***__\n\n**Name:** *${error.name}*\n**Method:** *${error.method}*\n**Code:** *${error.code}*\n**httpStatus:** *${error.httpStatus}*\n\n**Path:** \`${error.path}\`\n**Message:** \`${error.message}\``);
		if(error.message === 'Missing Permissions') {
			const channelID = error.path.match(/[0-9]{18}/);
			client.channels.cache.get(channelID).send(`\`An error occured:\`\n\`\`\`${error.name}: ${error.message}\`\`\``).catch(() => {
				console.error(`An error occured:\n${error.name}: ${error.message}`);
			});
		}
	}
	else {
		client.channels.cache.get('784192991492702218').send(`__***ERROR***__\n\n**Name:** *${error.name}*\n**Method:** *${error.method}*\n**Code:** *${error.code}*\n**httpStatus:** *${error.httpStatus}*\n\n**Message:** \`${error.message}\``);
	}
});

client.login(client.config.botToken);
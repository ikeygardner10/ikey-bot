/* eslint-disable quotes */
const config = require('../jsonFiles/config.json'); let prefix;
const active = new Map(); const ops = { active: active };
const { Collection } = require('discord.js'); const cooldowns = new Collection();
const permissionsObject = {
	'Administrator': 'ADMINISTRATOR', 'Create Invite': 'CREATE_INSTANT_INVITE',
	'Kick Members': 'KICK_MEMBERS', 'Ban Members': 'BAN_MEMBERS',
	'Manage Channels': 'MANAGE_CHANNELS', 'Manage Server': 'MANAGE_GUILD',
	'Manage Messages': 'MANAGE_MESSAGES', 'Mute Members': 'MUTE_MEMBERS',
	'Manage Nicknames': 'MANAGE_NICKNAMES', 'Manage Roles': 'MANAGE_ROLES',
	'Manage Emojis': 'MANAGE_EMOJIS',
};
const checkPrefix = 'SELECT `prefix` FROM `guildsettings` WHERE `guildID`= ?';
const updatePrefix = 'UPDATE `guildsettings` SET `prefix`= ? WHERE `guildID`= ?';
const addGuildSettings = 'INSERT INTO `guildsettings` (`guildID`, `prefix`, `maxFamilySize`, `allowIncest`, `tagDisable`, `nsfwDisable`) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `prefix`= VALUES (`prefix`), `allowIncest`= VALUES (`allowIncest`), `tagDisable`= VALUES (`tagDisable`), `nsfwDisable`= VALUES (`nsfwDisable`)';
const checkChannel = 'SELECT `channelID` FROM `disabledchannels` WHERE `guildID`= ? AND `channelID`= ?';

module.exports = async (client, message) => {

	// Ignore all bots, to stop looping or worse, ignore non guild message, or non text channels
	if(message.author.bot || !message.guild || message.channel.type !== 'text') return;

	// If someone mentions the bot, return
	if(message.mentions.users.first() && message.mentions.users.first().id === client.user.id) return;

	const SQLpool = client.conPool.promise();

	// Prefix reset command, hardcoded. The amount of times I've wanted or needed one
	// And the bots NEVER FUCKING HAVE ONE!
	if(message.content.startsWith(`${config.defaultPrefix}prefixreset`) && ((message.member.hasPermission('ADMINISTRATOR') || message.author.id === config.ownerID))) {
		return SQLpool.execute(updatePrefix, [config.defaultPrefix, message.guild.id])
			.then(() => {
				console.success(`[PREFIX RESET] Successfully updated record for guildsettings: ${message.guild.id}`);
				return message.channel.send(`\`Server prefix reset to ${config.defaultPrefix}\``);
			}).catch((error) => {
				console.error(`[PREFIX RESET] ${error.stack}`);
				return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
			});
	}
	// Define guildPrefix, await check MySQL DB for guild prefix
	// Define defaultPrefix from config.json
	// If user uses defaultPrefix with a custom guildPrefix set, send guildPrefix
	const [guildPrefix] = await SQLpool.execute(checkPrefix, [message.guild.id]);
	if(guildPrefix[0] !== undefined) {
		if(message.content.startsWith(guildPrefix[0].prefix)) {
			prefix = guildPrefix[0].prefix;
		} else if(message.content.startsWith(config.defaultPrefix) && guildPrefix[0].prefix !== config.defaultPrefix) {
			return message.channel.send(`Your server prefix is \`${guildPrefix[0].prefix}\`\nUse \`${config.defaultPrefix}prefixreset\` to reset to \`${config.defaultPrefix}\``);
		}
	} else {
		await SQLpool.execute(addGuildSettings, [message.guild.id, config.defaultPrefix, 250, false, false, false])
			.then(() => prefix = `${config.defaultPrefix}`)
			.catch((error) => {
				console.error(`[MESSAGE] ${error.stack}`);
				prefix = `${config.defaultPrefix}`;
			});
	}

	// If first char of message isn't prefix, ignore it
	if(message.content.indexOf(prefix) !== 0) return;

	// Define args, define commandName
	// Check for commandName in commands Collection
	const args = message.content.slice(1).trim().split(/ +/g); const commandName = args.shift().toLowerCase();
	const command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));
	if(!command) return;

	const [disabledChannel] = await SQLpool.execute(checkChannel, [message.guild.id, message.channel.id]);
	if(disabledChannel[0] !== undefined && disabledChannel[0].channelID === message.channel.id && command.config.name !== 'toggle') return;

	// Check for NSFW channel
	if(command.config.nsfw && !message.channel.nsfw) return message.channel.send('`NSFW channels only`');

	// Check for required user permissions
	if(command.config.permissions) {
		if(command.config.permissions === 'Bot Owner' && message.author.id !== config.ownerID) return message.channel.send(`\`Bot Owner Only\``);
		if(!message.member.hasPermission(permissionsObject[command.config.permissions]) && message.author.id !== config.ownerID) return message.channel.send(`\`Requires ${command.config.permissions} Permission\``);
	}

	// Check for required args on command
	// Define basic reply, redefine if command has config.usage
	if(command.config.args && !args.length) {
		let reply = `\`No args given\``;
		if(command.config.usage) reply += `\n\`Correct usage: ${prefix}${commandName} ${command.config.usage}\``;
		return message.channel.send(reply);
	}

	// Check for command cooldown map, if not, create new
	// Define now as date.now, timestamps and cooldown calculator
	// Also check if message.author is in cooldown map
	if(!cooldowns.has(command.config.name)) cooldowns.set(command.config.name, new Collection());
	const now = Date.now(); const timestamps = cooldowns.get(command.config.name); const cooldownAmount = (command.config.cooldown || 3) * 1000;
	if(timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
		if(now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			message.delete();
			return message.reply(`\`${commandName}\` cooldown: \`${timeLeft.toFixed(2)}s\``)
				.then(msg => {
					msg.delete({ timeout: expirationTime - now });
				}).catch((error) => {
					console.error(`[COOLDOWN ERROR] ${error.stack}`);
				});
		}
	}

	// Execute command, log info
	command.execute(client, message, args, ops);

	if(message.author.id !== config.ownerID) {
		timestamps.set(message.author.id, now);
		setTimeout(async () => timestamps.delete(message.author.id), cooldownAmount);
	}
};
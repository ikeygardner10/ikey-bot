/* eslint-disable quotes */
const config = require('../data/owner/config.json');
const active = new Map(); const ops = { active: active };
const { Collection } = require('discord.js'); const cooldowns = new Collection();
const { botPerms } = require('../data/arrayData.json');
const prefixReset = require('../functions/prefixReset');
const checkDisabledCmds = 'SELECT * FROM `disabledcommands` WHERE (`command`=? OR `command`=?) AND `guildID`= ? AND `channelID`= ?';

module.exports = async (client, message) => {

	// Ignore all bots, to stop looping or worse, ignore non guild message, or non text channels
	if(message.author.bot || !message.guild || message.channel.type !== 'text') return;

	// Check for guilds prefix from Enmap, otherwise use default
	const guildPrefix = client.prefixes.get(message.guild.id);
	const prefix = guildPrefix ? guildPrefix : config.defaultPrefix;

	// If someone mentions the bot, return guild prefix, hardcoded prefixreset
	const clientRegex = RegExp(`^<@!${client.user.id}>$`);
	if(message.content.match(clientRegex)) return message.channel.send(`Prefix for \`${message.guild.name}\` is \`${prefix}\``);
	if(message.content.startsWith(`${config.defaultPrefix}prefixreset`)) return prefixReset(client, message);

	// If first char of message isn't prefix, ignore it
	if(message.content.indexOf(prefix) !== 0) return;

	// Define args, define commandName
	// Check for commandName in commands Enmap
	const args = message.content.slice(1).trim().split(/ +/g); const commandName = args.shift().toLowerCase();
	const command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));
	if(!command) return;

	if(message.channel.permissionsFor(client.user).has("SEND_MESSAGES") === false) return;

	// Define SQLpool, query for disabled commands
	// If returns true and command isn't toggle, return
	const SQLpool = client.conPool.promise();
	const [checkAllRows] = await SQLpool.execute(checkDisabledCmds, ['all', command.config.name, message.guild.id, message.channel.id]);
	if(checkAllRows[0] !== undefined && command.config.name !== 'toggle') return;

	// Check for NSFW channel
	if(command.config.nsfw && !message.channel.nsfw) return message.channel.send('`NSFW channels only`');

	// Check for required user permissions
	if(command.config.permissions) {
		if(command.config.permissions === 'Bot Owner' && message.author.id !== config.ownerID) return message.channel.send(`\`Bot Owner Only\``);
		if(!message.member.hasPermission(botPerms[command.config.permissions]) && message.author.id !== config.ownerID) return message.channel.send(`\`Requires ${command.config.permissions} Permission\``);
	}

	// If someone uses bot against owner, return
	const ownerRegex = RegExp(`<@${config.ownerID}>`);
	if(message.content.match(ownerRegex) && command.config.category === 'admin') return;

	// Temp setting for alt accounts and tag features
	if(Date.now() - message.author.createdAt < 1000 * 60 * 60 * 24 * 7 && command.config.category === 'tag') return message.channel.send('`Invalid (ACC NEWER THAN 7 DAYS)`');

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
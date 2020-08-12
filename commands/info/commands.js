/* eslint-disable no-unused-vars */
const { MessageEmbed } = require('discord.js');
const fs = require('fs-extra');
const { promisify } = require('util');

module.exports = {
	config: {
		name: 'commands',
		aliases: ['lc', 'cmds'],
		usage: '',
		cooldown: 10,
		category: 'info',
		permissions: '',
		args: false,
		description: 'Display list of available commands',
	},
	execute: async (client, message, args) => {

		const checkPrefix = 'SELECT `prefix` FROM `guildsettings` WHERE `guildID`= ?';
		const SQLpool = client.conPool.promise(); const config = client.config;
		const [prefix] = await SQLpool.execute(checkPrefix, [message.guild.id]);
		const readdir = promisify(fs.readdir); const categories = await readdir('./commands/');

		const cEmbed = new MessageEmbed()
			.setAuthor(`${message.guild.me.displayName} Commands`, client.user.avatarURL())
			.setThumbnail(message.guild.iconURL({ format: 'png', dynamic: true, size: 512 }))
			.setDescription(`Available Commands for ${message.guild.me.displayName}\nServer Prefix is: **${prefix[0].prefix || config.defaultPrefix}**\nGlobal Prefix: **${config.defaultPrefix}**\nHelp: \`${prefix[0].prefix || config.defaultPrefix}help\` or \`${prefix[0].prefix || config.defaultPrefix}help <command>\``)
			.setFooter(`${message.guild.me.displayName} | Total Commands: ${client.commands.size}`, client.user.avatarURL())
			.setColor('0xFFFFFA');

		try {
			categories.forEach(category => {
				const dir = client.commands.filter(c => c.config.category === category);
				const capitalise = category.slice(0, 1).toUpperCase() + category.slice(1);
				if(capitalise === 'Owner' && message.author.id !== client.config.ownerID) return;
				cEmbed.addField(`> ${capitalise} [${dir.size}]:`, dir.map(c => `\`${c.config.name}\``).join(' '));
			});
		} catch(error) {
			console.error(`[COMMANDS CMD] ${error.stack}`);
			return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		}

		return message.channel.send(cEmbed);
	} };
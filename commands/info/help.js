const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'help',
		aliases: ['h'],
		usage: '<command (optional)>',
		cooldown: 5,
		category: 'info',
		permissions: '',
		args: false,
		description: 'Display help for commands',
	},
	execute: async (client, message, args) => {

		const checkPrefix = 'SELECT `prefix` FROM `guildsettings` WHERE `guildID`= ?';
		const SQLpool = client.conPool.promise(); const config = client.config;
		const [prefix] = await SQLpool.execute(checkPrefix, [message.guild.id]);

		if(args[0] == 'help') return message.channel.send(`Use \`${prefix[0].prefix || config.defaultPrefix}help\` or \`${prefix[0].prefix || config.defaultPrefix}help <command>\``);

		if(args[0]) {
			let command = args[0].toLowerCase();
			if(client.commands.has(command) || client.aliases.has(command)) {
				try {
					command = client.commands.get(command) || client.commands.get(client.aliases.get(command));
					const commandName = command.config.name.slice(0, 1).toUpperCase() + command.config.name.slice(1);
					const category = command.config.category.slice(0, 1).toUpperCase() + command.config.category.slice(1);
					const hEmbed = new MessageEmbed()
						.setAuthor(`${client.user.username} Help`, client.user.avatarURL())
						.setThumbnail(client.user.avatarURL({ format: 'png', dynamic: true, size: 512 }))
						.setDescription(`**Server Prefix: ${prefix[0].prefix || config.defaultPrefix}**\n\n**Name:** ${commandName}\n**Description:** ${command.config.description || 'No Description'}\n**Usage:** ${((prefix[0].prefix || config.defaultPrefix) + args[0] + ' ' + command.config.usage || (prefix[0].prefix || config.defaultPrefix) + args[0])}\n**Cooldown:** ${command.config.cooldown}s\n**Permissions Required:** ${command.config.permissions || 'None'}\n**Category:** ${category}\n**Aliases:** ${command.config.noalias || command.config.aliases}`)
						.addField('**Links**', '[All Commands](https://ikeybot.github.io)\n[Support Server](https://discord.gg/GQh6XEk)\n[Invite To Your Server](https://discord.com/oauth2/authorize?client_id=607091388588359687&permissions=1544027255&scope=bot)\n[Donate](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=CXU2L6XUT2YWN&source=url)')
						.setFooter(`${client.user.username}`, client.user.avatarURL())
						.setColor('0xFFFFFA')
						.setTimestamp();

					return message.channel.send(hEmbed);
				} catch(error) {
					console.error(`[HELP CMD] ${error.stack}`);
					return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
				}
			} else {
				return;
			}
		}

		if(!args[0]) {
			const dmEmbed = new MessageEmbed()
				.setAuthor(`${client.user.username} Help`, client.user.avatarURL())
				.setThumbnail(client.user.avatarURL({ format: 'png', dynamic: true, size: 512 }))
				.setDescription(`**Server Prefix: ${prefix[0].prefix || config.defaultPrefix}**\n**Global Prefix: ${config.defaultPrefix}**\n**Support Server:** [${await client.guilds.cache.get('413532909400752139').name || 'Link'}](https://discord.gg/GQh6XEk)`)
				.addField('**Links**', '[All Commands](https://ikeybot.github.io)\n[Support Server](https://discordapp.com/invite/GQh6XEk)\n[Invite To Your Server](https://discord.com/oauth2/authorize?client_id=607091388588359687&permissions=1544027255&scope=bot)\n[Donate](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=CXU2L6XUT2YWN&source=url)')
				.setFooter(`${client.user.username}`, client.user.avatarURL())
				.setColor('0xFFFFFA')
				.setTimestamp();

			try {
				await message.author.send(dmEmbed);
				return message.channel.send('`Incoming DM`');
			} catch(error) {
				console.error(`[HELP CMD] ${error.stack}`);
				return message.channel.send('`Invalid (DO YOU HAVE DMS OPEN?)`');
			}
		}
	} };
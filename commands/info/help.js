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

		// Check for guilds prefix from Enmap, otherwise use default
		const guildPrefix = client.prefixes.get(message.guild.id);
		const prefix = guildPrefix ? guildPrefix : client.config.defaultPrefix;

		if(args[0] == 'help') return message.lineReply(`Use \`${prefix}help\` or \`${prefix}help <command>\``);

		if(args[0]) {

			let command = args[0].toLowerCase();
			if(client.commands.has(command) || client.aliases.has(command)) {
				try {
					command = client.commands.get(command) || client.commands.get(client.aliases.get(command));
					const commandName = command.config.name.slice(0, 1).toUpperCase() + command.config.name.slice(1);
					const category = command.config.category.slice(0, 1).toUpperCase() + command.config.category.slice(1);
					const hEmbed = new MessageEmbed()
						.setAuthor(`${client.user.username} Help`, client.user.avatarURL())
						.setDescription(`**Name:** ${commandName}\n**Aliases:** ${command.config.noalias || command.config.aliases.join(', ')}\n**Usage:** ${(prefix + args[0] + ' ' + command.config.usage || prefix + args[0])}\n**Cooldown:** ${command.config.cooldown}s\n**Category:** ${category}\n**Permissions Required:** ${command.config.permissions || 'None'}\n**Description:**\n${command.config.description || 'No Description'}\n`)
						.setFooter(`Server Prefix is: ${prefix}`)
						.setTimestamp()
						.setColor(0xFFFFFA);

					return message.lineReply(hEmbed);
				}
				catch(error) {
					console.error(`[HELP CMD] ${error.stack}`);
					return message.lineReply(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
				}
			}
			else {
				return;
			}
		}

		if(!args[0]) {
			const dmEmbed = new MessageEmbed()
				.setAuthor(`${client.user.username} Help`, client.user.avatarURL())
				.setDescription(`**Default prefix is: ${client.config.defaultPrefix}**\n__***@IkeyBot***__ for your server prefix\n*$prefixreset* resets prefix to default\n\n**Getting Started:**\n*$help command* -- e.g. $help createtag\n*$logs channel-name* -- e.g. $logs invite-logs\n\n**Commands:**\nAll commands available [here](https://ikeybot.github.io/)\n\n**Add to Server:**\nJoin the bot to your server [here](https://discord.com/api/oauth2/authorize?client_id=607091388588359687&permissions=1544027255&scope=bot)\n\n**Help & Support:**\nSupport avaliable in [${await client.guilds.cache.get('413532909400752139').name || 'the support server'}](https://discord.gg/GQh6XEk)`)
				.setFooter(`${message.guild.name}`)
				.setTimestamp()
				.setColor(0xFFFFFA);

			await message.author.send(dmEmbed)
				.then(() => {
					return message.lineReply('`DM Sent`');
				})
				.catch(() => {
					message.channel.send('`Failed to send DM`');
					return message.lineReply(dmEmbed);
				});
		}
	} };
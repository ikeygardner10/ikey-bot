/* eslint-disable no-inner-declarations */
const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'toggle',
		aliases: ['tc'],
		usage: '<command>/all/list',
		cooldown: 5,
		category: 'admin',
		permissions: 'Manage Server',
		args: true,
		description: '**-** Disable/enable commands per channel\n**-** Disable ALL commands per channel\n**-** List currently disabled commands',
	},
	execute: async (client, message, args) => {

		const [guild, channel] = [message.guild, message.channel];
		let command; let commandName;
		const SQLpool = client.conPool.promise();
		const checkDisabledCommand = 'SELECT * FROM `disabledcommands` WHERE `command`=? AND `guildID`=? AND `channelID`=?;';
		const addDisabledCommand = 'INSERT INTO `disabledcommands` (`command`, `guildID`, `channelID`) VALUES (?, ?, ?);';
		const delDisabledCommand = 'DELETE FROM `disabledcommands` WHERE `command`=? AND `guildID`=? AND `channelID`=?;';
		const selectAll = 'SELECT * FROM `disabledcommands` WHERE `guildID`=?;';

		if(!args[0]) return message.lineReply('`Invalid (CHOOSE A COMMAND/ALL/LIST)`');
		if(!message.channel) return message.lineReply('`Invalid (INVALID CHANNEL TYPE');

		if(args[0].toLowerCase() === 'list') {

			const [allRows] = await SQLpool.execute(selectAll, [guild.id]);
			if(allRows[0] === undefined) return message.lineReply('`Invalid (NOTHING DISABLED)`');

			const tEmbed = new MessageEmbed()
				.setAuthor(`${guild.name}'s Disabled List`, guild.iconURL())
				.setThumbnail(guild.iconURL({ format: 'png', dynamic: true, size: 512 }))
				.setFooter(`${guild.me.displayName}`, client.user.avatarURL())
				.setTimestamp()
				.setColor(0xFFFFFA);


			await guild.channels.cache.forEach(chan => {
				if(chan.type !== 'text') return;
				const mappedRows = allRows.map(row => {
					if(row.channelID !== chan.id) return;
					if(!row.command) return;
					const cmd = `\`${row.command}\``;
					return cmd;
				});
				const filtered = mappedRows.filter(function(cmd) {
					return cmd != null;
				});
				if(filtered.length === 0) return;
				tEmbed.addField(`> ${chan.name}`, filtered.join(' '));
			});
			return message.lineReply(tEmbed);
		}

		if(args[0].toLowerCase() === 'all') {

			commandName = 'all';
			const [checkAllRows] = await SQLpool.execute(checkDisabledCommand, [commandName, guild.id, channel.id]);

			if(checkAllRows[0]) {
				return SQLpool.query(delDisabledCommand, [commandName, guild.id, channel.id])
					.then(() => {
						console.success(`[TOGGLE CMD] Successfully removed entry for command: ${commandName} in guild: ${guild.id} for channel: ${channel.id}`);
						return message.lineReply(`\`All commands enabled for channel: ${channel.name}\``);
					})
					.catch((error) => {
						console.error(`[TOGGLE CMD] ${error.stack}`);
						return message.lineReply(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
					});
			}
			if(!checkAllRows[0]) {
				return SQLpool.query(addDisabledCommand, [commandName, guild.id, channel.id])
					.then(() => {
						console.success(`[TOGGLE CMD] Successfully added entry for command: ${commandName} in guild: ${guild.id} for channel: ${channel.id}`);
						return message.lineReply(`\`All commands disabled for channel: ${channel.name}\``);
					})
					.catch((error) => {
						console.error(`[TOGGLE CMD] ${error.stack}`);
						return message.lineReply(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
					});
			}
		}

		command = args[0].toLowerCase();
		if(client.commands.has(command) || client.aliases.has(command)) {

			command = client.commands.get(command) || client.commands.get(client.aliases.get(command));
			commandName = command.config.name;

			const [checkCmdRows] = await SQLpool.execute(checkDisabledCommand, [commandName, guild.id, channel.id]);
			if(checkCmdRows[0]) {
				return SQLpool.query(delDisabledCommand, [commandName, guild.id, channel.id])
					.then(() => {
						console.success(`[TOGGLE CMD] Successfully removed entry for command: ${commandName} in guild: ${guild.id} for channel: ${channel.id}`);
						return message.lineReply(`\`${commandName} enabled for channel: ${channel.name}\``);
					})
					.catch((error) => {
						console.error(`[TOGGLE CMD] ${error.stack}`);
						return message.lineReply(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
					});
			}
			if(!checkCmdRows[0]) {
				return SQLpool.query(addDisabledCommand, [commandName, guild.id, channel.id])
					.then(() => {
						console.success(`[TOGGLE CMD] Successfully added entry for command: ${commandName} in guild: ${guild.id} for channel: ${channel.id}`);
						return message.lineReply(`\`${commandName} disabled for channel: ${channel.name}\``);
					})
					.catch((error) => {
						console.error(`[TOGGLE CMD] ${error.stack}`);
						return message.lineReply(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
					});
			}
		}
	} };
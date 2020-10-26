module.exports = {
	config: {
		name: 'toggle',
		aliases: ['tc'],
		usage: '<command>/all',
		cooldown: 5,
		category: 'admin',
		permissions: 'Manage Server',
		args: true,
		description: 'Disable/enable commands per channel\nOR\nDisable ALL commands per channel',
	},
	execute: async (client, message, args) => {

		const [guild, channel] = [message.guild, message.channel];
		let command; let commandName;
		const SQLpool = client.conPool.promise();
		const checkDisabledCommand = 'SELECT * FROM `disabledcommands` WHERE `command`=? AND `guildID`=? AND `channelID`=?;';
		const addDisabledCommand = 'INSERT INTO `disabledcommands` (`command`, `guildID`, `channelID`) VALUES (?, ?, ?);';
		const delDisabledCommand = 'DELETE FROM `disabledcommands` WHERE `command`=? AND `guildID`=? AND `channelID`=?;';

		if(!args[0]) return message.channel.send('`Invalid (CHOOSE A COMMAND OR ALL)`');
		if(!message.channel) return message.channel.send('`Invalid (INVALID CHANNEL TYPE');

		if(args[0].toLowerCase() === 'all') {

			commandName = 'all';
			const [checkAllRows] = await SQLpool.execute(checkDisabledCommand, [commandName, guild.id, channel.id]);

			if(checkAllRows[0]) {
				return SQLpool.query(delDisabledCommand, [commandName, guild.id, channel.id])
					.then(() => {
						console.success(`[TOGGLE CMD] Successfully removed entry for command: ${commandName} in guild: ${guild.id} for channel: ${channel.id}`);
						return message.channel.send(`\`All commands enabled for channel: ${channel.name}\``);
					})
					.catch((error) => {
						console.error(`[TOGGLE CMD] ${error.stack}`);
						return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
					});
			}
			if(!checkAllRows[0]) {
				return SQLpool.query(addDisabledCommand, [commandName, guild.id, channel.id])
					.then(() => {
						console.success(`[TOGGLE CMD] Successfully added entry for command: ${commandName} in guild: ${guild.id} for channel: ${channel.id}`);
						return message.channel.send(`\`All commands disabled for channel: ${channel.name}\``);
					})
					.catch((error) => {
						console.error(`[TOGGLE CMD] ${error.stack}`);
						return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
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
						return message.channel.send(`\`${commandName} enabled for channel: ${channel.name}\``);
					})
					.catch((error) => {
						console.error(`[TOGGLE CMD] ${error.stack}`);
						return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
					});
			}
			if(!checkCmdRows[0]) {
				return SQLpool.query(addDisabledCommand, [commandName, guild.id, channel.id])
					.then(() => {
						console.success(`[TOGGLE CMD] Successfully added entry for command: ${commandName} in guild: ${guild.id} for channel: ${channel.id}`);
						return message.channel.send(`\`${commandName} disabled for channel: ${channel.name}\``);
					})
					.catch((error) => {
						console.error(`[TOGGLE CMD] ${error.stack}`);
						return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
					});
			}
		}

		// 	if(checkLogsRows[0].invTracking === 0) {
		// 		if(!logsChannel) {
		// 			await message.guild.channels.create('logs', {
		// 				type: 'text',
		// 				position: '1',
		// 				reason: 'IkeyBot invite tracking',
		// 				permissionOverwrites: [
		// 					{
		// 						id: message.guild.id,
		// 						deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
		// 					}],
		// 			})
		// 				.then(() => {
		// 					return message.channel.send('`No logs channel was found, a new one has been created`');
		// 				})
		// 				.catch((error) => {
		// 					console.error(`[TOGGLE CMD] ${error.stack}`);
		// 					return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		// 				});
		// 		}
		// 		await addInvites(client, message.guild.id);
		// 		return SQLpool.execute(changeEnableLogs, [1, message.guild.id])
		// 			.then(() => {
		// 				console.success(`[TOGGLE CMD] Successfully updated record for invTracking: ${message.guild.id}, invTracking enabled`);
		// 				return message.channel.send('`Invite logs enabled`');
		// 			})
		// 			.catch((error) => {
		// 				console.error(`[TOGGLE CMD] ${error.stack}`);
		// 				return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		// 			});

		// 	} else {
		// 		return SQLpool.execute(changeEnableLogs, [0, message.guild.id])
		// 			.then(() => {
		// 				console.success(`[TOGGLE CMD] Successfully updated record for invTracking: ${message.guild.id}, invTracking disabled`);
		// 				return message.channel.send('`Invite logs disabled`');
		// 			})
		// 			.catch((error) => {
		// 				console.error(`[TOGGLE CMD] ${error.stack}`);
		// 				return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		// 			});
		// 	}
		// } else {
		// 	return message.channel.send('`Invalid (CHANNEL OR INVITE-LOG)`');
		// }
	} };
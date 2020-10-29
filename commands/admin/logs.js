const addInvites = require('../../functions/addInvites');

module.exports = {
	config: {
		name: 'logs',
		noalias: 'No Aliases',
		aliases: [],
		usage: '<command>/all',
		cooldown: 5,
		category: 'admin',
		permissions: 'Manage Server',
		args: false,
		description: 'Disable/enable logs',
	},
	execute: async (client, message, args) => {

		const SQLpool = client.conPool.promise();
		const checkInvTracking = 'SELECT `invTracking`, `logsChannel` FROM `guildsettings` WHERE `guildID`=?;';
		const changeEnableLogs = 'UPDATE `guildsettings` SET `invTracking`=?, `logsChannel`=? WHERE `guildID`=?;';

		const joinedArgs = args.join('-');

		const [checkLogRows] = await SQLpool.execute(checkInvTracking, [message.guild.id]);
		if(checkLogRows[0].invTracking === 1) {
			return SQLpool.execute(changeEnableLogs, [0, null, message.guild.id])
				.then(() => {
					console.success(`[TOGGLE CMD] Successfully updated record for invTracking: ${message.guild.id}, invTracking disabled`);
					return message.channel.send('`Logs disabled`');
				})
				.catch((error) => {
					console.error(`[TOGGLE CMD] ${error.stack}`);
					return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
				});

		} else {
			if(!joinedArgs) return message.channel.send('`Invalid (SPECIFY CHANNEL NAME)`');
			if(joinedArgs.length > 100) return message.channel.send('`Invalid (MAX CHANNEL NAME 100 CHAR)`');
			const logsChannel = message.guild.channels.cache.find(c => c.name === joinedArgs);
			if(!logsChannel) {
				await message.guild.channels.create(joinedArgs, {
					type: 'text',
					position: '500',
					reason: 'logs',
					permissionOverwrites: [
						{
							id: message.guild.id,
							deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
						}],
				})
					.then(() => {
						return message.channel.send(`\`No channel: ${joinedArgs} was found, a new one has been created\``);
					})
					.catch((error) => {
						console.error(`[TOGGLE CMD] ${error.stack}`);
						return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
					});
			}

			await addInvites(client, message.guild.id);
			return SQLpool.execute(changeEnableLogs, [1, joinedArgs, message.guild.id])
				.then(() => {
					console.success(`[TOGGLE CMD] Successfully updated record for invTracking: ${message.guild.id}, invTracking enabled`);
					return message.channel.send('`Invite logs enabled`');
				})
				.catch((error) => {
					console.error(`[TOGGLE CMD] ${error.stack}`);
					return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
				});
		}
	} };

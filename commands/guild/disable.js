module.exports = {
	config: {
		name: 'toggle',
		aliases: ['enable', 'disable'],
		usage: '',
		cooldown: 5,
		category: 'admin',
		permissions: 'Manage Server',
		args: false,
		description: 'Disable/enable bot in selected channel',
	},
	execute: async (client, message) => {

		const checkDisabledChannels = 'SELECT * FROM `disabledchannels` WHERE `guildID`= ? AND `channelID`= ?';
		const addDisabledChannel = 'INSERT INTO `disabledchannels` (`guildID`, `channelID`) VALUES (?, ?)';
		const deleteDisabledChannel = 'DELETE FROM `disabledchannels` WHERE `guildID`= ? AND `channelID`= ?';
		const SQLpool = client.conPool.promise();
		const [checkRows] = await SQLpool.query(checkDisabledChannels, [message.guild.id, message.channel.id]);

		if(checkRows[0] === undefined) {
			return SQLpool.execute(addDisabledChannel, [message.guild.id, message.channel.id])
				.then(() => {
					console.success(`[DISABLE CMD] Successfully added record for disabledchannels: ${message.guild.id}, ${message.channel.id}`);
					return message.channel.send(`Channel disabled: \`${message.channel.name}\``);
				}).catch((error) => {
					console.error(`[DISABLE CMD] ${error.stack}`);
					return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
				});
		} else {
			return SQLpool.execute(deleteDisabledChannel, [message.guild.id, message.channel.id])
				.then(() => {
					console.success(`[DISABLE CMD] Successfully removed record for disabledchannels: ${message.guild.id}, ${message.channel.id}`);
					return message.channel.send(`Channel enabled: \`${message.channel.name}\``);
				}).catch((error) => {
					console.error(`[DISABLE CMD] ${error.stack}`);
					return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
				});
		}
	} };
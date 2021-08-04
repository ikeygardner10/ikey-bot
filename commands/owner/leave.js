module.exports = {
	config: {
		name: 'leave',
		noalias: 'No Aliases',
		aliases: [],
		usage: '<guild ID>',
		cooldown: 1,
		category: 'owner',
		permissions: 'Bot Owner',
		args: true,
		description: 'Forces bot to leave guild',
	},
	execute: async (client, message, args) => {

		try {

			const id = args.join(' ');
			const guildName = await client.guilds.cache.get(args[0]).name;
			client.guilds.cache.get(id).leave();

			const SQLpool = client.conPool.promise();

			let stmt = 'UPDATE `guilds` SET `joined`=0 WHERE `guildID`=?;';
			await SQLpool.execute(stmt, [id])
				.then(() => {
					console.success(`[LEAVE CMD] Successfully deleted record for guild: ${args[0]}`);
					message.channel.send(`Updated guild record for: \`${guildName}\``);
				})
				.catch((error) => {
					console.error(`[LEAVE CMD] ${error.stack}`);
					return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
				});

			stmt = 'SET SQL_SAFE_UPDATES=0; DELETE FROM `guildsettings` WHERE `guildID`=?;';
			await SQLpool.query(stmt, [id])
				.then(() => {
					console.success(`[LEAVE CMD] Successfully deleted record for guildsettings: ${args[0]}`);
					message.channel.send(`Deleted guildsettings record for: \`${guildName}\``);
				})
				.catch((error) => {
					console.error(`[LEAVE CMD] ${error.stack}`);
					return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
				});

			console.success(`Left guild: ${guildName} (${args[0]})`);
			return message.lineReply(`Left server: \`${guildName}\``);

		}
		catch(error) {
			console.error(`[LEAVE CMD] ${error.stack}`);
			return message.lineReply(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		}
	},
};
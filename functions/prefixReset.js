module.exports = function(client, message) {

	const SQLpool = client.conPool.promise();
	const updatePrefix = 'UPDATE `guildsettings` SET `prefix`= ? WHERE `guildID`= ?;';

	if(!message.member.hasPermission('ADMINISTRATOR') && message.author.id !== client.config.ownerID) return;

	client.prefixes.set(message.guild.id, client.config.defaultPrefix);
	return SQLpool.execute(updatePrefix, [client.config.defaultPrefix, message.guild.id])
		.then(() => {
			console.success(`[PREFIX RESET] Successfully updated record for guildsettings: ${message.guild.id}`);
			return message.channel.send(`\`Server prefix reset to ${client.config.defaultPrefix}\``);
		}).catch((error) => {
			console.error(`[PREFIX RESET] ${error.stack}`);
			return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		});
};
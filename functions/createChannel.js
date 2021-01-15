module.exports = (client, guild, channelName = 'logs', type = 'text', position = 500, reason, id, denyPerm = ['VIEW_CHANNEL', 'SEND_MESSAGES']) => {

	return guild.channels.create(channelName, {
		type: type,
		position: position,
		reason: reason,
		permissionOverwrites: [
			{
				id: id,
				deny: denyPerm,
			},
			{
				id: client.user.id,
				allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'MANAGE_MESSAGES'],
			},
		],
	})
		.then(() => {
			return console.success(`[CHANNEL CREATE] Successfully created ${channelName} channel in guild: ${guild.id}`);
		})
		.catch(error => {
			return console.error(`[CHANNEL CREATE] ${error.stack}`);
		});
};
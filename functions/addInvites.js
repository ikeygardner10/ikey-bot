module.exports = function(client, guildID) {

	const SQLpool = client.conPool.promise();
	const addInvite = 'INSERT INTO `invites` (`code`, `guildID`, `uses`, `inviterID`) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE `uses`= VALUES (`uses`);';

	const guild = client.guilds.cache.get(guildID);
	guild.fetchInvites()
		.then(guildInvites => {
			guildInvites.forEach(invite => {
				SQLpool.execute(addInvite, [invite.code, invite.guild.id, invite.uses || null, invite.inviter.id || null])
					.catch((error) => {
						console.error(error.stack);
					});
			});
		})
		.catch((error) => {
			console.error(`[INV ARRAY] ${error.stack}`);
		});

	return console.success(`[ADD INV] Successfully added invites for guild: ${guildID}`);
};
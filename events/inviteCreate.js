module.exports = async (client, invite) => {

	const SQLpool = client.conPool.promise();
	const addInvite = 'INSERT INTO `invites` (`code`, `guildID`, `uses`, `inviterID`) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE `uses`= VALUES (`uses`);';
	const checkTracking = 'SELECT `invTracking` FROM `guildsettings` WHERE `guildID`=?;';

	const [trckRows] = await SQLpool.query(checkTracking, [invite.guild.id]);
	if(trckRows[0].invTracking === 0) return;

	return SQLpool.execute(addInvite, [invite.code, invite.guild.id, invite.uses || null, invite.inviter.id || null])
		.then(() => {
			console.success(`[INV CREATE] Successfully added invite: ${invite.code} for guild: ${invite.guild.id}`);
		})
		.catch((error) => {
			return console.error(error.stack);
		});

};
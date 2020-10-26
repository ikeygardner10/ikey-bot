module.exports = async (client, invite) => {

	const SQLpool = client.conPool.promise();
	const deleteInvite = 'SET SQL_SAFE_UPDATES=0; DELETE FROM `invites` WHERE `code`=? AND `guildID`=?;';
	const checkTracking = 'SELECT `invTracking` FROM `guildsettings` WHERE `guildID`=?;';

	const [trckRows] = await SQLpool.query(checkTracking, [invite.guild.id]);
	if(trckRows[0].invTracking === 0) return;

	return SQLpool.query(deleteInvite, [invite.code, invite.guild.id])
		.then(() => {
			console.success(`[INV DEL] Successfully deleted invite: ${invite.code} for guild: ${invite.guild.id}`);
		})
		.catch((error) => {
			return console.error(error.stack);
		});

};
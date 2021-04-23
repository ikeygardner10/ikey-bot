const { MessageEmbed } = require('discord.js');
const wait = require('util').promisify(setTimeout);
const createChannel = require('../functions/createChannel');

module.exports = async (client, member) => {


	const updateGuild = 'UPDATE `guilds` SET `members`=? WHERE `guildID`=?;';
	const checkLogSettings = 'SELECT `members`, `logChannel` FROM `logsettings` WHERE `guildID`=?;';
	const checkMarriages = 'SELECT * FROM `marriages` WHERE (`userID`=? OR `partnerID`=?) AND `guildID`=?;';
	const deleteMarriage = 'SET SQL_SAFE_UPDATES=0; DELETE FROM `marriages` WHERE `familyID`=? AND `guildID`=?;';
	const checkAdoptions = 'SELECT * FROM `adoptions` WHERE `familyID`=? AND `guildID`=?;';
	const deleteAdoptions = 'SET SQL_SAFE_UPDATES=0; DELETE FROM `adoptions` WHERE `familyID`=? AND `guildID`=?;';
	const checkAdopted = 'SELECT * FROM `adoptions` WHERE `childID`=? AND `guildID`=?;';
	const deleteAdopted = 'SET SQL_SAFE_UPDATES=0; DELETE FROM `adoptions` WHERE `childID`=? AND `guildID`=?;';

	const SQLpool = client.conPool.promise();

	await SQLpool.execute(updateGuild, [member.guild.members.cache.size, member.guild.id])
		.then(() => {
			console.success(`[GUILD MEMBER REMOVE] Successfully updated record for guild: ${member.guild.id}`);
		}).catch((error) => {
			console.error(`[GUILD MEMBER REMOVE] ${error.stack}`);
		});


	await wait(1500);

	const [logRows] = await SQLpool.query(checkLogSettings, [member.guild.id]);
	const [members, channel] = [logRows[0].members, logRows[0].logChannel];
	if(members === 0) return;


	const checkBan = await member.guild.fetchBans()
		.then(bans => {
			if(bans.some(u => member.id.includes(u.user.id))) {
				return true;
			} else {
				return false;
			}
		});
	if(checkBan) return;


	const logsChannel = member.guild.channels.cache.find(ch => ch.name === channel);
	if(!logsChannel) {
		await createChannel(client, member.guild, channel, 'text', 500, 'logs', member.guild.id, [], ['VIEW_CHANNEL', 'SEND_MESSAGES'])
			.catch((error) => {
				console.error(`[GUILD MEMBER REMOVE] ${error.stack}`);
			});
	}

	const iEmbed = new MessageEmbed()
		.setAuthor('Member Leave', member.guild.iconURL())
		.setThumbnail(member.user.avatarURL())
		.setDescription(`**Username:** ${member.user.tag}`)
		.setFooter(`ID: ${member.user.id}`)
		.setTimestamp()
		.setColor(0xFFFFFA);

	logsChannel.send(iEmbed);

	const [marriedRows] = await SQLpool.query(checkMarriages, [member.id, member.id, member.guild.id]);
	if(marriedRows[0]) {
		const marriedFamilyID = marriedRows[0].familyID;
		const [adoptionRows] = await SQLpool.query(checkAdoptions, [marriedFamilyID, member.guild.id]);
		if(adoptionRows[0]) {
			await SQLpool.query(deleteAdoptions, [marriedFamilyID, member.guild.id])
				.then(() => {
					console.info(`[GUILD MEMBER REMOVE] Adoptions deleted for familyID: ${marriedFamilyID} in guild: ${member.guild.id}`);
				})
				.catch((error) => {
					console.error(`[GUILD MEMBER REMOVE] ${error.stack}`);
				});
		}
		await SQLpool.query(deleteMarriage, [marriedFamilyID, member.guild.id])
			.then(() => {
				console.info(`[GUILD MEMBER REMOVE] Marriage deleted for user: ${member.id} in guild: ${member.guild.id}`);
			})
			.catch((error) => {
				console.error(`[GUILD MEMBER REMOVE] ${error.stack}`);
			});
	}
	const [adoptedRows] = await SQLpool.query(checkAdopted, [member.id, member.guild.id]);
	if(adoptedRows[0]) {
		await SQLpool.query(deleteAdopted, [member.id, member.guild.id])
			.then(() => {
				console.info(`[GUILD MEMBER REMOVE] Adoption deleted for user: ${member.id} in guild: ${member.guild.id}`);
			})
			.catch((error) => {
				console.error(`[GUILD MEMBER REMOVE] ${error.stack}`);
			});
	}

};
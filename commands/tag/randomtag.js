const fs = require('fs-extra');

module.exports = {
	config: {
		name: 'randomtag',
		aliases: ['rt', 'rtag'],
		usage: '',
		cooldown: 5,
		category: 'tag',
		permissions: '',
		args: false,
		description: 'Sends a random tag',
	},
	execute: async (client, message) => {

		let fileName; let fileURL; const fileGrab = fs.access;

		const checkRandom = 'SELECT `tag`, `content`, `imageURL` FROM `tags` WHERE BINARY `guildID` IS NULL OR `guildID`= ? ORDER BY RAND() LIMIT 1;';

		const SQLpool = client.conPool.promise();
		console.info('[VIEW TAG] Querying database for random tag');
		return SQLpool.query(checkRandom, [message.guild.id])
			.then(([rows]) => {
				if(rows[0].imageURL !== null) {
					fileURL = rows[0].imageURL; fileName = fileURL.substring(fileURL.lastIndexOf('/') + 1, fileURL.length);
					return fileGrab(fileURL)
						.then(() => {
							console.success(`[RANDOM TAG] Random tag sent: ${rows[0].tag}`);
							return message.channel.send(`${rows[0].content}\n\n*Tag:* ${rows[0].tag}`, { files: [{ attachment: fileURL, name: fileName }] });
						})
						.catch((error) => {
							console.error(`[RANDOM TAG] ${error.stack}`);
							console.error(`[RANDOM TAG] Random tag image ${rows[0].imageURL} corrupted`);
							console.success(`[RANDOM TAG] Random tag sent: ${rows[0].tag}`);
							return message.channel.send(`${rows[0].content}\n\n**(file corrupted)**\n\n*Tag:* ${rows[0].tag}`);
						});
				} else {
					console.success(`[RANDOM TAG] Random tag sent: ${rows[0].tag}`);
					return message.channel.send(`${rows[0].content}\n\n*Tag:* ${rows[0].tag}`);
				}
			}).catch((error) => {
				console.error(`[RANDOM TAG] ${error.stack}`);
				return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
			});
	} };
const wait = require('util').promisify(setTimeout);

module.exports = {
	config: {
		name: 'mario',
		noalias: 'No Aliases',
		aliases: [],
		usage: '',
		cooldown: 60,
		category: 'image',
		permissions: '',
		args: false,
		description: 'Mario',
	},
	execute: async (client, message) => {

		return message.channel.send({ files: [{ attachment: 'D:/images/mario/mario1.jpeg', name: 'mario1.jpeg' }] })
			.then(async mOne => {
				await wait(4500);
				mOne.delete();
				return message.channel.send({ files: [{ attachment: 'D:/images/mario/mario2.jpeg', name: 'mario2.jpeg' }] })
					.then(async mTwo => {
						await wait(7000);
						mTwo.delete();
						return message.channel.send({ files: [{ attachment: 'D:/images/mario/mario3.jpeg', name: 'mario3.jpeg' }] })
							.then(async mThree => {
								await wait(500);
								mThree.delete();
								return message.channel.send({ files: [{ attachment: 'D:/images/mario/mario4.jpeg', name: 'mario4.jpeg' }] });
							})
							.catch(error => console.error(`[MARIO CMD] ${error.stack}`));
					})
					.catch(error => console.error(`[MARIO CMD] ${error.stack}`));
			})
			.catch(error => console.error(`[MARIO CMD] ${error.stack}`));

	} };
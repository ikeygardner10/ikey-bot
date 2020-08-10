/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const txtFormatter = require('../../functions/txtFormatter.js');
const fs = require('fs');

module.exports = {
	config: {
		name: 'copytags',
		noaliase: 'No Aliases',
		aliases: [],
		usage: '',
		cooldown: 5,
		category: 'owner',
		permissions: 'Bot Owner',
		args: false,
		description: 'Copy tags from KorewaBot to IkeyBot',
	},
	execute: async (client, message, args) => {

		const tagsArray = JSON.parse(fs.readFileSync('../KorewaBot2/jsonFiles/tags/tagsFile.json'));
		let array = Object.keys(tagsArray);
		const SQLpool = client.conPool.promise();
		for (let i = 0; i < array.length; i++) {
			let key = array[i];
			let value = tagsArray[key];
			let ntn = txtFormatter(key);
			let ntc = txtFormatter(value.tag);

			await SQLpool.execute('INSERT INTO `tags` (`tag`, `content`, `userID`, `guildCreated`) VALUES (?, ?, ?, ?)', [ntn, ntc, value.userID, '724722792431485001'])
				.then(() => console.success(`${key} added to tags test db`))
				.catch((error) => console.error(`${key} failed to add`));
		}
	},
};
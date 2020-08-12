const fs = require('fs-extra');

module.exports = {
	config: {
		name: 'copycounts',
		noalias: 'No Aliases',
		aliases: [],
		usage: '',
		cooldown: 5,
		category: 'owner',
		permissions: 'Bot Owner',
		args: false,
		description: 'Copy message counts from KorewaBot to IkeyBot',
	},
	execute: async (client) => {

		const SQLpool = client.conPool.promise();

		fs.readdir('./../KorewaBot2/jsonFiles/count/', (error, files) => {
			if(error) return console.error(`[COPY COUNTS] ${error.stack}`);
			files.forEach(file => {
				const count = JSON.parse(fs.readFileSync(`./../KorewaBot2/jsonFiles/count/${file}`));
				const array = Object.keys(count);
				let table = file.slice(0, file.lastIndexOf('.'));
				if(table === 'hhcount') table = table.replace(/hhcount/, 'handholdcount');
				if(table === 'rapecount') return;
				for (let i = 0; i < array.length; i++) {
					const key = array[i];
					const value = count[key];
					const userID = key.slice(0, key.lastIndexOf('+') - 1);
					const memberID = key.slice(key.lastIndexOf('+') + 2, key.length);
					SQLpool.query(`INSERT INTO \`${table}\` (\`userID\`, \`memberID\`, \`messageCount\`) VALUES ('${userID}', '${memberID}', '${value.messageCount}') ON DUPLICATE KEY UPDATE \`messageCount\`=${value.messageCount}`)
						.then(() => console.info(`${key} added to ${table} test db`))
						.catch((err) => console.error(`[COPY COUNTS] ${err.stack}`));
				}
			});
		});
	},
};
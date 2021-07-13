module.exports = {
	config: {
		name: 'crazimo',
		noalias: 'No Aliases',
		aliases: [],
		usage: '',
		cooldown: 3,
		category: 'image',
		permissions: '',
		args: false,
		description: 'Crazimo',
	},
	execute: async (client, message) => {

		const crazimoArray = client.imageArrays.crazimo; const file = crazimoArray[(Math.floor(Math.random() * crazimoArray.length))];

		try {
			return message.channel.send({ files: [{ attachment: 'D:/images/crazimo/' + file, name: file }] });
		} catch(error) {
			console.error(`[CRAZIMO CMD] ${error.stack}`);
			return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		}
	} };
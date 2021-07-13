module.exports = {
	config: {
		name: 'tights',
		aliases: ['tight'],
		usage: '',
		cooldown: 3,
		category: 'nsfw',
		permissions: '',
		args: false,
		nsfw: true,
		description: 'Sends a random tights image',
	},
	execute: async (client, message) => {

		const tightsArray = client.imageArrays.tights; const file = tightsArray[(Math.floor(Math.random() * tightsArray.length))];

		try {
			return message.channel.send({ files: [{ attachment: 'D:/images/Tights/' + file, name: file }] });
		} catch(error) {
			console.error(`[TIGHTS CMD] ${error.stack}`);
			return message.channel.send(`**:exclamation: An error occured:**\`\`\`${error.stack}\`\`\``);
		}
	} };
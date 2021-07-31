module.exports = {
	config: {
		name: 'waifu',
		noalias: 'No Aliases',
		aliases: [],
		usage: '',
		cooldown: 3,
		category: 'image',
		permissions: '',
		args: false,
		description: 'Random image of peoples favorite waifu\'s',
	},
	execute: async (client, message) => {

		const waifuArray = client.imageArrays.waifu;
		const file = waifuArray[(Math.floor(Math.random() * waifuArray.length))];

		try {
			return message.lineReply({ files: [{ attachment: 'D:/images/waifu/' + file, name: file }] });
		}
		catch(error) {
			console.error(`[WAIFU CMD] ${error.stack}`);
			return message.lineReply(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		}
	} };
module.exports = {
	config: {
		name: 'eval',
		noalisas: 'No Aliases',
		aliases: [],
		usage: '<JS code>',
		cooldown: 1,
		category: 'owner',
		permissions: 'Bot Owner',
		args: true,
		description: 'Runs JS code entered as args',
	},
	execute: async (client, message, args) => {

		function clean(text) {
			if(typeof (text) === 'string') return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));
			else return text;
		}

		try {

			const code = args.join(' ');
			let evaled = eval(code);
			if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);

			return message.lineReply(clean(evaled), { code:'xl' });

		}
		catch(error) {
			console.error(`[EVAL CMD] ${error.stack}`);
			return message.lineReply(`\`ERROR\` \`\`\`xl\n${clean(error)}\n\`\`\``);
		}

	},
};

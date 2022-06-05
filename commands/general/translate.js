const translate = require('@vitalets/google-translate-api');
const { languageCodes, languages, yes, no } = require('../../data/arrayData.json');

module.exports = {
	config: {
		name: 'translate',
		aliases: ['to', 'tr'],
		usage: '<language code> <text to translate>',
		cooldown: 3,
		category: 'general',
		permissions: '',
		args: true,
		description: 'Translate input text to a specified language (auto detects input language)\nLanguage codes: https://cloud.google.com/translate/docs/languages',
	},
	execute: async (client, message, args) => {

		const [lang, ...restArgs] = args;
		let text = restArgs.join(' ');

		if(!lang) return message.lineReply('`Invalid (NO LANGUAGE SPECIFIED)`');
		if(!languageCodes.includes(lang)) return message.lineReply('`Invalid (NOT A VALID LANGUAGE - USE $help translate)`');
		if(!text) return message.lineReply('`Invalid (NOTHING TO TRANSLATE)`');
		if(text.length > 1750) return message.lineReply(''`Invalid (MAX. 1750 CHAR TRANSLATION)`);

		let results = await translate(`${text}`, { to: lang });

		if(results.from.text.didYouMean === true) {
			const filter = response => {
				return yes.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === message.author.id) ||
				no.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === message.author.id);
			};

			await message.channel.send(`${message.author} did you mean: "${results.from.text.value}"?`).then((msg) => {
				message.channel.awaitMessages(filter, { max: 1, time: 15000, errors: ['time'] })
					.then(async collected => {
						if(yes.includes(collected.first().content.toLowerCase())) {
							text = results.from.text.value;
							text = await text.replace(/\[/g, '');
							text = await text.replace(/]/g, '');
							results = await translate(`${text}`, { to: lang });
							return message.lineReply(`**Translated from ${languages[results.from.language.iso]} to ${languages[lang]}:**\n${results.text}`);
						}
						else if(no.includes(collected.first().content.toLowerCase())) {
							return message.lineReply(`**Translated from ${languages[results.from.language.iso]} to ${languages[lang]}:**\n${results.text}`);
						}
					}).catch((error) => {
						msg.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
						return console.error(`[TRANSLATE CMD] ${error.stack}`);
					});
			});
		}
		else {
			return message.lineReply(`**Translated from ${languages[results.from.language.iso]} to ${languages[lang]}:**\n${results.text}`);
		}

	} };
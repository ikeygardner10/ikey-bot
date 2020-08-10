const fs = require('fs');

module.exports = {
	execute: async (client) => {
		const imageArrays = {
			choke: [], crazimo: [],
			dodgefail: [], dodgesuccess: [],
			fuck: [], handhold: [],
			highfive: [], hug: [],
			kiss: [], pat: [],
			punch: [], shoot: [],
			slap: [], spank: [],
			stab: [], tights: [],
			waifu: [], responseEmojis: [],
		};
		client.imageArrays = imageArrays;

		fs.readdir('./images/', (error, folders) => {
			if(error) return console.error(`[IMG ARRAYS] ${error.stack}`);
			folders.forEach(folder => {
				switch(folder) {
				case 'self': case 'tags': return;
				}
				fs.readdir(`./images/${folder}`, (err, images) => {
					if(err) return console.error(`[IMG ARRAYS] ${error.stack}`);
					if(images.length > 500) {
						fs.writeFile(`./data/temp/${folder}.json`, JSON.stringify(images, null, ''), (err) => {
							if(err) return console.error(`[IMG ARRAYS] ${err.stack}`);
							console.info(`[IMG ARRAYS] Temp array written for ${folder}.json`);
						});
					} else {
						images.forEach(image => {
							imageArrays[folder].push(image);
							console.info(`[IMG ARRAYS] ./commands/${folder}/${image} added!`);
						});
					}
				});
			});
		});
	} };
const fs = require('fs-extra');

module.exports = {
	execute: (client) => {
		const imageArrays = {
			choke: [], crazimo: [],
			dodgefail: [], dodgesuccess: [],
			doubledance: [], fuck: [],
			handhold: [], highfive: [],
			hug: [], kiss: [],
			pat: [], punch: [],
			shoot: [], shootself: [],
			singledance: [], slap: [],
			spank: [], stab: [],
			tights: [], waifu: [],
		};
		client.imageArrays = imageArrays;

		fs.readdir('D:/images/', (error, folders) => {
			if(error) return console.error(`[IMG ARRAYS] ${error.stack}`);
			folders.forEach(folder => {
				switch(folder) {
				case 'self': case 'tags': return;
				}
				fs.readdir(`D:/images/${folder}`, (err, images) => {
					if(err) return console.error(`[IMG ARRAYS] ${err.stack}`);
					if(images.length > 500) {
						fs.writeFile(`./data/temp/${folder}.json`, JSON.stringify(images, null, ''), (err) => {
							if(err) return console.error(`[IMG ARRAYS] ${err.stack}`);
							console.info(`[IMG ARRAYS] Temp array written for ${folder}.json`);
						});
					} else {
						images.forEach(image => {
							imageArrays[folder].push(image);
							console.info(`[IMG ARRAYS] D:/images/${folder}/${image} added!`);
						});
					}
				});
			});
		});
	} };
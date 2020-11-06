module.exports = async (client) => {

	const clientActivities = [
		'fiftyzu x tkdwn. - Kamikaze', 'Inhale (Feat. GRiMM Doza) [Prod. Ricky Reasonz & GRiMM Doza]',
		'fuzgod - hound dog [prod. drippy]', '#MasterRoshiFingerRoll [Prod. GRiMM Doza x Ricky Reasonz]',
		'TUAMIE - Raw Cashews', 'Wun Two - winter in rio',
		'7XVN - https://MURDER.com (PROD. 7XVN)', 'kill ebola - siren sounds [prod. kill ebola + pulse + plurbs',
	];

	const activitySettings = [
		{ url: 'https://www.youtube.com/watch?v=TYStOJ25T60', type: 'STREAMING' }, { url: 'https://www.youtube.com/watch?v=Eof2scqapsI', type: 'STREAMING' },
		{ url: 'https://www.youtube.com/watch?v=pc7LAxRgRIQ', type: 'STREAMING' }, { url: 'https://www.youtube.com/watch?v=aIaEmG_XRQw', type: 'STREAMING' },
		{ url: 'https://www.youtube.com/watch?v=iYrfikKvhFA', type: 'STREAMING' }, { url: 'https://www.youtube.com/watch?v=on2SvsO1s0E', type: 'STREAMING' },
		{ url: 'https://www.youtube.com/watch?v=-xpaBdgz32c', type: 'STREAMING' }, { url: 'https://www.youtube.com/watch?v=3MCa_0Xc7rU', type: 'STREAMING' },
	];

	setInterval(() => {
		const index = Math.floor(Math.random() * (clientActivities.length - 1) + 1);
		client.user.setActivity(clientActivities[index], activitySettings[index]);
	}, 1000 * 120);

};
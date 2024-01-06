/** @type {import('tailwindcss').Config}*/
const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			fontFamily: {
				inter: ['Inter', 'sans-serif']
			},
			screens: {
				'-sm': { max: '640px' }
			}
		}
	},

	plugins: []
};

module.exports = config;

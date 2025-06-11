const { combineRgb } = require('@companion-module/base')

module.exports = {
	initPresets: function () {
		let self = this
		let presets = []

		const foregroundColor = combineRgb(255, 255, 255) // White
		const foregroundColorBlack = combineRgb(0, 0, 0) // Black
		const backgroundColorRed = combineRgb(255, 0, 0) // Red
		const backgroundColorWhite = combineRgb(255, 255, 255) // White

		for (let timernum = 1; timernum <= 2; timernum++) {
			presets.push({
				category: 'Current time',
				label: 'Time button',
				bank: {
					style: 'text',
					text: '$(timer:timer' + timernum + '_time)',
					size: '18',
					color: '16777215',
					bgcolor: 0,
				},
				feedbacks: [
					{
						type: 'timer_running',
						options: {
							bg: 65280,
							fg: 16777215,
							timer: timernum,
						},
					},
				],
				actions: [],
			})
		}

		self.setPresetDefinitions(presets)
	},
}

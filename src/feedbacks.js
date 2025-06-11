const { combineRgb } = require('@companion-module/base')

module.exports = {
	initFeedbacks: function () {
		let self = this
		let feedbacks = {}

		const foregroundColorWhite = combineRgb(255, 255, 255) // White
		const backgroundColorRed = combineRgb(255, 0, 0) // Red
		const backgroundColorGreen = combineRgb(0, 255, 0) // Green
		const backgroundColorOrange = combineRgb(255, 102, 0) // Orange

		feedbacks['timer_enabled'] = {
			name: 'Change colors on Alert Time',
			type: 'boolean',
			defaultStyle: {
				color: foregroundColorWhite,
				bgcolor: backgroundColorRed,
			},
			options: [
				{ 
					type: 'dropdown',
					label: 'Timer',
					id: 'timer',
					default: 1,
					choices: self.CHOICES_TIMERS
				}
			],
			callback: (feedback) => {
				if (
					self.timers['timer' + feedback.options.timer] !== undefined &&
					self.timers['timer' + feedback.options.timer].enabled === 'True'
				) {
					return true
				}

				return false
			},
		}

		feedbacks['timer_running'] = {
			name: 'Change colors on Timer Running',
			type: 'boolean',
			defaultStyle: {
				color: foregroundColorWhite,
				bgcolor: backgroundColorGreen,
			},
			options: [
				{ 
					type: 'dropdown',
					label: 'Timer',
					id: 'timer',
					default: 1,
					choices: self.CHOICES_TIMERS
				}
			],
			callback: (feedback) => {
				if (
					self.timers['timer' + feedback.options.timer] !== undefined &&
					self.timers['timer' + feedback.options.timer].running === 'True'
				) {
					return true
				}

				return false
			},
		}

		feedbacks['timer_onovertime'] = {
			name: 'Change colors on Overtime',
			type: 'boolean',
			defaultStyle: {
				color: foregroundColorWhite,
				bgcolor: backgroundColorRed,
			},
			options: [
				{ 
					type: 'dropdown',
					label: 'Timer',
					id: 'timer',
					default: 1,
					choices: self.CHOICES_TIMERS
				}
			],
			callback: (feedback) => {
				if (
					self.timers['timer' + feedback.options.timer] !== undefined &&
					self.timers['timer' + feedback.options.timer].onovertime === 'True'
				) {
					return true
				}

				return false
			},
		}

		feedbacks['timer_onend'] = {
			name: 'Change colors on Timer End',
			type: 'boolean',
			defaultStyle: {
				color: foregroundColorWhite,
				bgcolor: backgroundColorRed,
			},
			options: [
				{ 
					type: 'dropdown',
					label: 'Timer',
					id: 'timer',
					default: 1,
					choices: self.CHOICES_TIMERS
				}
			],
			callback: (feedback) => {
				if (
					self.timers['timer' + feedback.options.timer] !== undefined &&
					self.timers['timer' + feedback.options.timer].onend === 'True'
				) {
					return true
				}

				return false
			},
		}

		feedbacks['timer_onalert'] = {
			name: 'Change colors on Alert Time',
			type: 'boolean',
			defaultStyle: {
				color: foregroundColorWhite,
				bgcolor: backgroundColorOrange,
			},
			options: [
				{ 
					type: 'dropdown',
					label: 'Timer',
					id: 'timer',
					default: 1,
					choices: self.CHOICES_TIMERS
				}
			],
			callback: (feedback) => {
				if (
					self.timers['timer' + feedback.options.timer] !== undefined &&
					self.timers['timer' + feedback.options.timer].onalert === 'True'
				) {
					return true
				}

				return false
			},
		}

		this.setFeedbackDefinitions(feedbacks)
	},
}

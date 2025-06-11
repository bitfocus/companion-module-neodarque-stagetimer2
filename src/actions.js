module.exports = {
	// ##########################
	// #### Instance Actions ####
	// ##########################
	initActions: function () {
		let self = this
		let actions = {}

		actions['basic_start'] = {
			name: 'Start timer',
			options: [
				{
					type: 'dropdown',
					label: 'Timer #',
					id: 'timerNumber',
					default: '1',
					choices: self.CHOICES_TIMERNUMBER,
				},
			],
			callback: async function (event) {
				let options = event.options
				self.oscSend(self.config.host, self.config.port, '/timer/' + options.timerNumber + '/start', [])
			},
		}

		actions['basic_stop'] = {
			name: 'Stop timer',
			options: [
				{
					type: 'dropdown',
					label: 'Timer #',
					id: 'timerNumber',
					default: '1',
					choices: self.CHOICES_TIMERNUMBER,
				},
			],
			callback: async function (event) {
				let options = event.options
				self.oscSend(self.config.host, self.config.port, '/timer/' + options.timerNumber + '/stop', [])
			},
		}

		actions['basic_reset'] = {
			name: 'Reset timer',
			options: [
				{
					type: 'dropdown',
					label: 'Timer #',
					id: 'timerNumber',
					default: '1',
					choices: self.CHOICES_TIMERNUMBER,
				},
			],
			callback: async function (event) {
				let options = event.options
				self.oscSend(self.config.host, self.config.port, '/timer/' + options.timerNumber + '/reset', [])
			},
		}

		actions['basic_enable'] = {
			name: 'Enable timer',
			options: [
				{
					type: 'dropdown',
					label: 'Timer #',
					id: 'timerNumber',
					default: '1',
					choices: self.CHOICES_TIMERNUMBER,
				},
			],
			callback: async function (event) {
				let options = event.options
				self.oscSend(self.config.host, self.config.port, '/timer/' + options.timerNumber + '/enable', [])
			},
		}

		actions['basic_disable'] = {
			name: 'Disable timer',
			options: [
				{
					type: 'dropdown',
					label: 'Timer #',
					id: 'timerNumber',
					default: '1',
					choices: self.CHOICES_TIMERNUMBER,
				},
			],
			callback: async function (event) {
				let options = event.options
				self.oscSend(self.config.host, self.config.port, '/timer/' + options.timerNumber + '/disable', [])
			},
		}

		actions['basic_next'] = {
			name: 'Next timer',
			options: [
				{
					type: 'dropdown',
					label: 'Timer #',
					id: 'timerNumber',
					default: '1',
					choices: self.CHOICES_TIMERNUMBER,
				},
			],
			callback: async function (event) {
				let options = event.options
				self.oscSend(self.config.host, self.config.port, '/timer/' + options.timerNumber + '/entry/next', [])
			},
		}

		actions['basic_previous'] = {
			name: 'Previous timer',
			options: [
				{
					type: 'dropdown',
					label: 'Timer #',
					id: 'timerNumber',
					default: '1',
					choices: self.CHOICES_TIMERNUMBER,
				},
			],
			callback: async function (event) {
				let options = event.options
				self.oscSend(self.config.host, self.config.port, '/timer/' + options.timerNumber + '/entry/previous', [])
			},
		}

		actions['fullscreen_enter'] = {
			name: 'Enter fullscreen',
			options: [],
			callback: async function (event) {
				self.oscSend(self.config.host, self.config.port, '/fullscreen/enter', [])
			},
		}

		actions['fullscreen_leave'] = {
			name: 'Exit fullscreen',
			options: [],
			callback: async function (event) {
				self.oscSend(self.config.host, self.config.port, '/fullscreen/exit', [])
			},
		}

		actions['timer_index'] = {
			name: 'Load Timer',
			options: [
				{
					type: 'dropdown',
					label: 'Timer #',
					id: 'timerNumber',
					default: '1',
					choices: self.CHOICES_TIMERNUMBER,
				},
				{
					type: 'textinput',
					label: 'index #',
					id: 'timerIndex',
					default: 1,
					useVariables: true,
				},
			],
			callback: async function (event) {
				let options = event.options

				let timerIndex = await self.parseVariablesInString(options.timerIndex)

				let bol = {
					type: 'i',
					value: parseInt(timerIndex),
				}
				self.oscSend(self.config.host, self.config.port, '/timer/' + options.timerNumber + '/entry/index', [bol])
			},
		}

		actions['timer_set'] = {
			name: 'Set Timer Time',
			options: [
				{
					type: 'dropdown',
					label: 'Timer #',
					id: 'timerNumber',
					default: '1',
					choices: self.CHOICES_TIMERNUMBER,
				},
				{
					type: 'textinput',
					label: 'Time',
					id: 'timeGO',
					regex: '/^(\\d+:)?(\\d+:)?\\d+$/',
					default: '00:00:00',
					useVariables: true,
				},
			],
			callback: async function (event) {
				let options = event.options
				let input = await self.parseVariablesInString(options.timeGO)
				
				let match
				let h = {
					type: 'i',
					value: 0,
				}
				let m = {
					type: 'i',
					value: 0,
				}
				let s = {
					type: 'i',
					value: 0,
				}
				if ((match = input.match(/^(\d+)$/))) {
					s = {
						type: 'i',
						value: parseInt(match[1]),
					}
				} else if ((match = input.match(/^(\d+):(\d+)$/))) {
					m = {
						type: 'i',
						value: parseInt(match[1]),
					}
					s = {
						type: 'i',
						value: parseInt(match[2]),
					}
				} else if ((match = input.match(/^(\d+):(\d+):(\d+)$/))) {
					h = {
						type: 'i',
						value: parseInt(match[1]),
					}
					m = {
						type: 'i',
						value: parseInt(match[2]),
					}
					s = {
						type: 'i',
						value: parseInt(match[3]),
					}
				}
				self.oscSend(self.config.host, self.config.port, '/timer/' + options.timerNumber + '/entry/time', [h, m, s])
			},
		}

		actions['timer_message'] = {
			name: 'Set Message',
			options: [
				{
					type: 'textinput',
					label: 'Message',
					id: 'message',
					regex: '/^.+$/',
					default: 'Hello World',
					useVariables: true,
				},
			],
			callback: async function (event) {
				let options = event.options

				let message = await self.parseVariablesInString(options.message)

				self.oscSend(self.config.host, self.config.port, '/message', [
					{
						type: 's',
						value: message,
					},
				])
			},
		}

		actions['timer_message_clear'] = {
			name: 'Clear Message',
			options: [],
			callback: async function (event) {
				self.oscSend(self.config.host, self.config.port, '/message/clear', [])
			},
		}

		actions['timer_indecrease'] = {
			name: 'Increase/Decrease Timer',
			options: [
				{
					type: 'dropdown',
					label: 'Timer #',
					id: 'timerNumber',
					default: '1',
					choices: self.CHOICES_TIMERNUMBER,
				},
				{
					type: 'dropdown',
					label: 'Increase/Decrease',
					id: 'timerInDecrease',
					default: 'increase',
					choices: self.CHOICES_INDECREASE,
				},
				{
					type: 'dropdown',
					label: 'Type',
					id: 'timerTimeType',
					default: 'minutes',
					choices: self.CHOICES_TIMETYPE,
				},
				{
					type: 'textinput',
					label: 'Time',
					id: 'timerTime',
					useVariables: true,
				},
			],
			callback: async function (event) {
				let options = event.options

				let timerTime = await self.parseVariablesInString(options.timerTime)

				let bol = {
					type: 'i',
					value: parseInt(timerTime),
				}
				self.oscSend(
					self.config.host,
					self.config.port,
					`/timer/${options.timerNumber}/${options.timerTimeType}/${options.timerInDecrease}`,
					[bol]
				)
			},
		}

		this.setActionDefinitions(actions)
	},
}

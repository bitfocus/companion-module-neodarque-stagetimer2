const { Regex } = require('@companion-module/base')

module.exports = {
	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info1',
				width: 12,
				label: 'Information',
				value: `This module controls Neodarque\'s StageTimer2.`,
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 6,
				default: '127.0.0.1',
				regex: Regex.IP,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'OSC Server Port',
				width: 3,
				default: '8001',
				regex: Regex.PORT,
			},
			{
				type: 'textinput',
				id: 'port_display',
				label: 'StageTimerDisplay Port',
				width: 3,
				default: '4870',
				regex: Regex.PORT,
			},
			{
				type: 'static-text',
				id: 'hr1',
				width: 12,
				label: '',
				value: '<hr />',
			},
			{
				type: 'checkbox',
				id: 'verbose',
				label: 'Enable Verbose Logging',
				default: false,
				width: 3,
			},
			{
				type: 'static-text',
				id: 'info3',
				width: 9,
				label: ' ',
				value: `Enabling Verbose Logging will push all incoming and outgoing data to the log, which is helpful for debugging.`,
			},
		]
	},
}
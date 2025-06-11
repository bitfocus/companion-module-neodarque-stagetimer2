module.exports = {
	initVariables: function () {
		let self = this
		let variables = [
			{ variableId: 'timer1_time', name: 'timer 1 current time' },
			{ variableId: 'timer2_time', name: 'timer 2 current time' },
			{ variableId: 'timer1_type', name: 'timer 1 type' },
			{ variableId: 'timer2_type', name: 'timer 2 type' },
			{ variableId: 'timer1_enabled', name: 'timer 1 state' },
			{ variableId: 'timer2_enabled', name: 'timer 2 state' },
			{ variableId: 'timer1_isonend', name: 'timer 1 ended' },
			{ variableId: 'timer2_isonend', name: 'timer 2 ended' },
			{ variableId: 'timer1_isonovertime', name: 'timer 1 ended' },
			{ variableId: 'timer2_isonovertime', name: 'timer 2 ended' },
			{ variableId: 'timer1_isrunning', name: 'timer 1 state' },
			{ variableId: 'timer2_isrunning', name: 'timer 2 state' },
			{ variableId: 'timer1_isonalert', name: 'timer 1 alert state' },
			{ variableId: 'timer2_isonalert', name: 'timer 2 alert state' },
		]

		this.setVariableDefinitions(variables)
	},
}

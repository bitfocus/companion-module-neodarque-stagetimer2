var tcp           = require('../../tcp');
var instance_skel = require('../../instance_skel');
var xml2js   = require('xml2js');
var debug;
var log;

function instance(system, id, config) {

	var self = this;
	instance_skel.apply(this, arguments);

	self.actions(); // export actions
	self.timers = {};
	self.timers['timer1'] = {};
	self.timers['timer2'] = {};

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.init_tcp();
	self.config = config;
	self.init_variables();
	self.init_feedbacks();
	self.init_presets();
};

instance.prototype.init = function() {
	var self = this;
	self.status(self.STATE_ERROR);
	self.init_tcp();
	self.init_variables();
	self.init_feedbacks();
	self.init_presets();
	debug = self.debug;
	log = self.log;
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 6,
			default: '127.0.0.1',
			regex: self.REGEX_IP
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'OSC Server Port',
			width: 3,
			default: '8001',
			regex: self.REGEX_PORT
		},
		{
			type: 'textinput',
			id: 'port_display',
			label: 'StageTimerDisplay Port',
			width: 3,
			default: '4870',
			regex: self.REGEX_PORT
		}
	]
};

instance.prototype.init_variables = function() {
	var self = this;

	var variables = [
		{ name: 'timer1_time', label: 'timer 1 current time' },
		{ name: 'timer2_time', label: 'timer 2 current time' },
		{ name: 'timer1_type', label: 'timer 1 type' },
		{ name: 'timer2_type', label: 'timer 2 type' },
		{ name: 'timer1_enabled', label: 'timer 1 state' },
		{ name: 'timer2_enabled', label: 'timer 2 state' },
		{ name: 'timer1_isonend', label: 'timer 1 ended' },
		{ name: 'timer2_isonend', label: 'timer 2 ended' },
		{ name: 'timer1_isonovertime', label: 'timer 1 ended' },
		{ name: 'timer2_isonovertime', label: 'timer 2 ended' },
		{ name: 'timer1_isrunning', label: 'timer 1 state' },
		{ name: 'timer2_isrunning', label: 'timer 2 state' },
		{ name: 'timer1_isonalert', label: 'timer 1 alert state' },
		{ name: 'timer2_isonalert', label: 'timer 2 alert state' },
	];

	self.setVariableDefinitions(variables);

};

instance.prototype.init_tcp = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	if (self.config.host) {

		self.socket = new tcp(self.config.host, self.config.port_display);

		self.socket.on('status_change', function (status, message) {
			self.status(status, message);
		});

		self.socket.on('error', function (err) {
			debug("Network error", err);
			self.status(self.STATE_ERROR, err);
			self.log('error',"Network error: " + err.message);
		});

		self.socket.on('connect', function () {
			self.status(self.STATE_OK);
			debug("Connected");
		})

		self.socket.on('data', function (data) {
			if (data !== undefined && data.toString().match(/Timers/)) {
				var xml = data.toString();
				xml2js.parseStringPromise(xml).then(function (result) {
					if (result !== undefined && result.Timers !== undefined && result.Timers.Timer !== undefined) {
						var t = result.Timers.Timer;

						var t1 = t[0]['$'];
						var t2 = t[1]['$'];

						self.setVariable('timer1_time', t1['CurrentTimeString'] );
						self.setVariable('timer2_time', t2['CurrentTimeString'] );
						self.setVariable('timer1_name', t1['Name'] );
						self.setVariable('timer2_name', t2['Name'] );
						self.setVariable('timer1_type', t1['TimerType'] );
						self.setVariable('timer2_type', t2['TimerType'] );
						self.setVariable('timer1_enabled', t1['IsEnabled'] );
						self.setVariable('timer2_enabled', t2['IsEnabled'] );
						self.setVariable('timer1_isonend', t1['IsOnEnd'] );
						self.setVariable('timer2_isonend', t2['IsOnEnd'] );
						self.setVariable('timer1_isonovertime', t1['IsOnOvertime'] );
						self.setVariable('timer2_isonovertime', t2['IsOnOvertime'] );
						self.setVariable('timer1_isrunning', t1['IsRunning'] );
						self.setVariable('timer2_isrunning', t2['IsRunning'] );
						self.setVariable('timer1_isonalert', t1['IsOnAlert'] );
						self.setVariable('timer2_isonalert', t2['IsOnAlert'] );

						self.timers['timer1'] = {
							onend: t1['IsOnEnd'],
							onovertime: t1['IsOnOvertime'],
							onalert: t1['IsOnAlert'],
							time: t1['CurrentTimeString'],
							name: t1['Name'],
							type: t1['TimerType'],
							enabled: t1['IsEnabled'],
							running: t1['IsRunning']
						};

						self.timers['timer2'] = {
							onend: t2['IsOnEnd'],
							onovertime: t2['IsOnOvertime'],
							onalert: t2['IsOnAlert'],
							time: t2['CurrentTimeString'],
							name: t2['Name'],
							type: t2['TimerType'],
							enabled: t2['IsEnabled'],
							running: t2['IsRunning']
						};

						self.checkFeedbacks('timer_enabled');
						self.checkFeedbacks('timer_running');
						self.checkFeedbacks('timer_onend');
						self.checkFeedbacks('timer_onalert');
						self.checkFeedbacks('timer_onovertime');

					}
				})
				.catch(function (err) {
					self.log('error',"Error during proccessing data",err)
				});
			}
		});
	}
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
	}
};

instance.prototype.CHOICES_TIMERS = [
	{ label: 'Timer 1', id: '1' },
	{ label: 'Timer 2', id: '2' }
];

instance.prototype.CHOICES_BASIC = [
	{ label: 'start', id: 'start' },
	{ label: 'stop', id: 'stop' },
	{ label: 'reset', id: 'reset' },
	{ label: 'enable', id: 'enable' },
	{ label: 'disable', id: 'disable' },
	{ label: 'next', id: 'entry/next' },
	{ label: 'previous', id: 'entry/previous' },
	{ label: 'Enter fullscreen', id: 'fullscreen/enter' },
	{ label: 'Exit fullscreen', id: 'fullscreen/exit' }
];

instance.prototype.CHOICES_TIMERNUMBER = [
	{ label: '1', id: '1' },
	{ label: '2', id: '2' }
];

instance.prototype.CHOICES_INDECREASE = [
	{ label: 'increase', id: 'increase' },
	{ label: 'decrease', id: 'decrease' }
];

instance.prototype.CHOICES_TIMETYPE = [
	{ label: 'seconds', id: 'seconds' },
	{ label: 'minutes', id: 'minutes' },
	{ label: 'hours', id: 'hours' }
];

instance.prototype.actions = function(system) {
	var self = this;
	self.system.emit('instance_actions', self.id, {
		'basic_start': {
			label: 'Start timer',
			options: [
				{
					type: 'dropdown',
					label: 'Timer #',
					id: 'timerNumber',
					default: '1',
					choices: self.CHOICES_TIMERNUMBER
				}
			]
		},
		'basic_stop': {
			label: 'Stop timer',
			options: [
				{
					type: 'dropdown',
					label: 'Timer #',
					id: 'timerNumber',
					default: '1',
					choices: self.CHOICES_TIMERNUMBER
				}
			]
		},
		'basic_reset': {
			label: 'Reset timer',
			options: [
				{
					type: 'dropdown',
					label: 'Timer #',
					id: 'timerNumber',
					default: '1',
					choices: self.CHOICES_TIMERNUMBER
				}
			]
		},
		'basic_enable': {
			label: 'Enable timer',
			options: [
				{
					type: 'dropdown',
					label: 'Timer #',
					id: 'timerNumber',
					default: '1',
					choices: self.CHOICES_TIMERNUMBER
				}
			]
		},
		'basic_disable': {
			label: 'Disable timer',
			options: [
				{
					type: 'dropdown',
					label: 'Timer #',
					id: 'timerNumber',
					default: '1',
					choices: self.CHOICES_TIMERNUMBER
				}
			]
		},
		'basic_next': {
			label: 'Next timer',
			options: [
				{
					type: 'dropdown',
					label: 'Timer #',
					id: 'timerNumber',
					default: '1',
					choices: self.CHOICES_TIMERNUMBER
				}
			]
		},
		'basic_previous': {
			label: 'Previous timer',
			options: [
				{
					type: 'dropdown',
					label: 'Timer #',
					id: 'timerNumber',
					default: '1',
					choices: self.CHOICES_TIMERNUMBER
				}
			]
		},
		'timer_index': {
			label: 'Load timer',
			options: [
				{
					type: 'dropdown',
					label: 'Timer number',
					id: 'timerNumber',
					default: '1',
					choices: self.CHOICES_TIMERNUMBER
				},
				{
					type: 'textinput',
					label: 'index #',
					id: 'timerIndex',
					default: 1
				}
			]
		},
		'timer_set': {
			label: 'Set timer time',
			options: [
				{
					type: 'dropdown',
					label: 'Timer #',
					id: 'timerNumber',
					default: '1',
					choices: self.CHOICES_TIMERNUMBER
				},
				{
					type: 'textinput',
					label: 'Time',
					id: 'timeGO',
					regex: '/^(\\d+:)?(\\d+:)?\\d+$/'
				}
			]
		},
		'timer_message': {
			label: 'Set message',
			options: [
				{
					type: 'textinput',
					label: 'Message',
					id: 'message',
					regex: '/^.+$/'
				}
			]
		},
		'timer_message_clear': {
			label: 'Clear message',
			options: []
		},
		'fullscreen_enter': {
			label: 'Enter fullscreen',
			options: []
		},
		'fullscreen_leave': {
			label: 'Leave fullscreen',
			options: []
		},
		'timer_indecrease': {
			label: 'Increase/Decrease timer',
			options: [
				{
					type: 'dropdown',
					label: 'Timer #',
					id: 'timerNumber',
					default: '1',
					choices: self.CHOICES_TIMERNUMBER
				},
				{
					type: 'dropdown',
					label: 'increase/decrease',
					id: 'timerInDecrease',
					default: 'increase',
					choices: self.CHOICES_INDECREASE
				},
				{
					type: 'dropdown',
					label: 'type',
					id: 'timerTimeType',
					default: 'minutes',
					choices: self.CHOICES_TIMETYPE
				},
				{
					type: 'textinput',
					label: 'time',
					id: 'timerTime'
				}
			]
		}

	});
}


instance.prototype.init_feedbacks = function() {

	var self = this;
	var feedbacks = {};

	feedbacks['timer_enabled'] = {
		label: 'Change colors on alert time',
		description: 'Change colors on alert time',
		options: [
			{ type: 'colorpicker', label: 'Foreground color',	id: 'fg', default: self.rgb(255,255,255) },
			{ type: 'colorpicker', label: 'Background color', id: 'bg', default: self.rgb(0,255,0) },
			{ type: 'dropdown', label: 'Timer', id: 'timer', default: 1, choices: self.CHOICES_TIMERS }
		]
	};

	feedbacks['timer_running'] = {
		label: 'Change colors on timer running',
		description: 'Change colors on timer running',
		options: [
			{ type: 'colorpicker', label: 'Foreground color',	id: 'fg', default: self.rgb(255,255,255) },
			{ type: 'colorpicker', label: 'Background color', id: 'bg', default: self.rgb(0,255,0) },
			{ type: 'dropdown', label: 'Timer', id: 'timer', default: 1, choices: self.CHOICES_TIMERS }
		]
	};

	feedbacks['timer_onovertime'] = {
		label: 'Change colors on overtime',
		description: 'Change colors on overtime',
		options: [
			{ type: 'colorpicker', label: 'Foreground color',	id: 'fg', default: self.rgb(255,255,255) },
			{ type: 'colorpicker', label: 'Background color', id: 'bg', default: self.rgb(255,0,0) },
			{ type: 'dropdown', label: 'Timer', id: 'timer', default: 1, choices: self.CHOICES_TIMERS }
		]
	};

	feedbacks['timer_onend'] = {
		label: 'Change colors on timer end',
		description: 'Change colors on timer end',
		options: [
			{ type: 'colorpicker', label: 'Foreground color',	id: 'fg', default: self.rgb(255,255,255) },
			{ type: 'colorpicker', label: 'Background color', id: 'bg', default: self.rgb(255,0,0) },
			{ type: 'dropdown', label: 'Timer', id: 'timer', default: 1, choices: self.CHOICES_TIMERS }
		]
	};

	feedbacks['timer_onalert'] = {
		label: 'Change colors on alert time',
		description: 'Change colors on alert time',
		options: [
			{ type: 'colorpicker', label: 'Foreground color',	id: 'fg', default: self.rgb(255,255,255) },
			{ type: 'colorpicker', label: 'Background color', id: 'bg', default: self.rgb(255,100,0) },
			{ type: 'dropdown', label: 'Timer', id: 'timer', default: 1, choices: self.CHOICES_TIMERS }
		]
	};

	self.setFeedbackDefinitions(feedbacks);
};

instance.prototype.feedback = function(feedback, bank) {

	var self = this;

	if (feedback.type == 'timer_enabled') {
		if (self.timers['timer' + feedback.options.timer] !== undefined && self.timers['timer' + feedback.options.timer].enabled === 'True') {
			return { color: feedback.options.fg, bgcolor: feedback.options.bg };
		}
	}

	if (feedback.type == 'timer_running') {
		if (self.timers['timer' + feedback.options.timer] !== undefined && self.timers['timer' + feedback.options.timer].running === 'True') {
			return { color: feedback.options.fg, bgcolor: feedback.options.bg };
		}
	}

	if (feedback.type == 'timer_onovertime') {
		if (self.timers['timer' + feedback.options.timer] !== undefined && self.timers['timer' + feedback.options.timer].onovertime === 'True') {
			return { color: feedback.options.fg, bgcolor: feedback.options.bg };
		}
	}

	if (feedback.type == 'timer_onend') {
		if (self.timers['timer' + feedback.options.timer] !== undefined && self.timers['timer' + feedback.options.timer].onend === 'True') {
			return { color: feedback.options.fg, bgcolor: feedback.options.bg };
		}
	}

	if (feedback.type == 'timer_onalert') {
		if (self.timers['timer' + feedback.options.timer] !== undefined && self.timers['timer' + feedback.options.timer].onalert === 'True') {
			return { color: feedback.options.fg, bgcolor: feedback.options.bg };
		}
	}

};

instance.prototype.action = function(action) {

	var self = this;
	var m;

	if (action.action === 'timer_message') {

		self.system.emit('osc_send', self.config.host, self.config.port, "/message", [ {
			type: "s",
			value: action.options.message
		} ] );

	}

	else if (action.action === 'timer_message_clear') {
		self.system.emit('osc_send', self.config.host, self.config.port, "/message/clear", [ ] );
	}

	else if (action.action === 'fullscreen_enter') {
		debug("enter fullscreen");
		self.system.emit('osc_send', self.config.host, self.config.port, "/fullscreen/enter", [ ] );
	}

	else if (action.action === 'fullscreen_leave') {
		debug("exit fullscreen");
		self.system.emit('osc_send', self.config.host, self.config.port, "/fullscreen/exit", [ ] );
	}

	else if (m = action.action.match(/^basic_([a-z]+)$/)) {
		for (var n in self.CHOICES_BASIC) {
			if (self.CHOICES_BASIC[n].label === m[1]) {
				self.system.emit('osc_send', self.config.host, self.config.port, "/timer/" + action.options.timerNumber + "/" + self.CHOICES_BASIC[n].id, []);
			}
		}
	}

	else if (action.action == 'timer_index') {

		var bol = {
				type: "i",
				value: parseInt(action.options.timerIndex)
		};

		self.system.emit('osc_send', self.config.host, self.config.port, "/timer/" + action.options.timerNumber + "/entry/index", [ bol ] );

	}

	else if (action.action == 'timer_set') {

		var input = action.options.timeGO;
		var match;

		var h = {
			type: "i",
			value: 0
		};

		var m = {
			type: "i",
			value: 0
		};

		var s = {
			type: "i",
			value: 0
		};

		if (match = input.match(/^(\d+)$/)) {

			s = {
				type: "i",
				value: parseInt(match[1])
			};

		}

		else if (match = input.match(/^(\d+):(\d+)$/)) {

			m = {
				type: "i",
				value: parseInt(match[1])
			};

			s = {
				type: "i",
				value: parseInt(match[2])
			};

		}

		else if (match = input.match(/^(\d+):(\d+):(\d+)$/)) {

			h = {
				type: "i",
				value: parseInt(match[1])
			};

			m = {
				type: "i",
				value: parseInt(match[2])
			};

			s = {
				type: "i",
				value: parseInt(match[3])
			};

		}

		self.system.emit('osc_send', self.config.host, self.config.port, "/timer/" + action.options.timerNumber + "/entry/time", [ h, m, s ] );

	}

	else if (action.action == 'timer_indecrease') {

		var bol = {
				type: "i",
				value: parseInt(action.options.timerTime)
		};
		self.system.emit('osc_send', self.config.host, self.config.port, `/timer/${action.options.timerNumber}/${action.options.timerTimeType}/${action.options.timerInDecrease}`, [ bol ] );

	}
};



instance.prototype.init_presets = function () {
	var self = this;
	var presets = [];
	for (var timernum = 1; timernum <= 2; timernum++) {

		presets.push({
			category: 'Current time',
			label: 'Time button',
			bank: {
				style: 'text',
				text: '$(timer:timer'+timernum+'_time)',
				size: '18',
				color: '16777215',
				bgcolor: 0
			},
			feedbacks: [
				{
					type: 'timer_running',
					options: {
						bg: 65280,
						fg: 16777215,
						timer: timernum
					}
				}
			],
			actions: [
			]
		});
	}
	self.setPresetDefinitions(presets);
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;

var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}

instance.prototype.init = function() {
	var self = this;

	self.status(self.STATE_OK);

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
			width: 8,
			regex: self.REGEX_IP
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'Target Port',
			width: 4,
			regex: self.REGEX_PORT
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;
	debug("destroy");
};

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
instance.prototype.actions = function(system) {
	var self = this;
	self.system.emit('instance_actions', self.id, {
		'basic_command': {
			label: 'Basic commands',
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
					label: 'command',
					id: 'timerCommand',
					default: 'start',
					choices: self.CHOICES_BASIC
				}
			]
		},
		'timer_index': {
			label: 'Set timer entry to timer on index',
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
		}
	});
}

instance.prototype.action = function(action) {
	var self = this;

	debug('action: ', action);

	if (action.action == 'basic_command') {
		self.system.emit('osc_send', self.config.host, self.config.port, "/timer/" + action.options.timerNumber + "/" + action.options.timerCommand, []);
	}

	if (action.action == 'timer_index') {
		var bol = {
				type: "i",
				value: parseInt(action.options.timerIndex)
		};
		self.system.emit('osc_send', self.config.host, self.config.port, "/timer/" + action.options.timerNumber + "/entry/index", [ bol ] );
	}

	if (action.action == 'timer_set') {
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
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;

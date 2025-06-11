// AtlasIED Atmopshere

const { InstanceBase, InstanceStatus, runEntrypoint } = require('@companion-module/base')
const UpgradeScripts = require('./src/upgrades')

const config = require('./src/config')
const actions = require('./src/actions')
const feedbacks = require('./src/feedbacks')
const variables = require('./src/variables')
const presets = require('./src/presets')

const constants = require('./src/constants')
const utils = require('./src/utils')

class stagetimer2Instance extends InstanceBase {
	constructor(internal) {
		super(internal)

		// Assign the methods from the listed files to this class
		Object.assign(this, {
			...config,
			...actions,
			...feedbacks,
			...variables,
			...presets,
			...constants,
			...utils,
		})

		this.socket = undefined

		this.timers = {}
		this.timers['timer1'] = {}
		this.timers['timer2'] = {}
	}

	async destroy() {
		if (this.socket !== undefined) {
			this.socket.destroy()
		}
	}

	async init(config) {
		this.configUpdated(config)
	}

	async configUpdated(config) {
		this.updateStatus(InstanceStatus.Connecting)

		this.config = config

		this.initActions()
		this.initFeedbacks()
		this.initVariables()
		this.initPresets()

		this.initConnection()
	}
}

runEntrypoint(stagetimer2Instance, UpgradeScripts)

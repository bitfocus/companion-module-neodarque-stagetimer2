const { InstanceStatus, TCPHelper } = require('@companion-module/base')

const xml2js = require('xml2js')

module.exports = {
	initConnection: function () {
		let self = this

		if (self.socket !== undefined) {
			self.socket.destroy()
			delete self.socket
		}

		if (self.config.port === undefined) {
			self.config.port = 8001
		}

		if (self.config.port_display === undefined) {
			self.config.port_display = 4870
		}

		if (self.config.host) {
			self.log('info', `Opening connection to ${self.config.host}:${self.config.port_display}`)

			self.socket = new TCPHelper(self.config.host, self.config.port_display)

			self.socket.on('error', function (err) {
				if (self.config.verbose) {
					self.log('warn', 'Error: ' + err)
				}
				self.updateStatus(InstanceStatus.ConnectionFailure)
			})

			self.socket.on('connect', function () {
				self.updateStatus(InstanceStatus.Ok)
			})

			self.socket.on('data', function (data) {
				try {
					if (data !== undefined && data.toString().match(/Timers/)) {
						let xml = data.toString()
						if (self.config.verbose) {
							self.log('debug', 'Received data: ' + xml)
						}
						xml2js
							.parseStringPromise(xml)
							.then(function (result) {
								if (self.config.verbose) {
									self.log('debug', 'Parsed data: ' + JSON.stringify(result))
								}
								if (result !== undefined && result.Timers !== undefined && result.Timers.Timer !== undefined) {
									let t = result.Timers.Timer

									let t1 = t[0]['$']
									let t2 = t[1]['$']

									let variableObj = {}

									variableObj['timer1_time'] = t1['CurrentTimeString']
									variableObj['timer2_time'] = t2['CurrentTimeString']
									variableObj['timer1_name'] = t1['Name']
									variableObj['timer2_name'] = t2['Name']
									variableObj['timer1_type'] = t1['TimerType']
									variableObj['timer2_type'] = t2['TimerType']
									variableObj['timer1_enabled'] = t1['IsEnabled']
									variableObj['timer2_enabled'] = t2['IsEnabled']
									variableObj['timer1_isonend'] = t1['IsOnEnd']
									variableObj['timer2_isonend'] = t2['IsOnEnd']
									variableObj['timer1_isonovertime'] = t1['IsOnOvertime']
									variableObj['timer2_isonovertime'] = t2['IsOnOvertime']
									variableObj['timer1_isrunning'] = t1['IsRunning']
									variableObj['timer2_isrunning'] = t2['IsRunning']
									variableObj['timer1_isonalert'] = t1['IsOnAlert']
									variableObj['timer2_isonalert'] = t2['IsOnAlert']

									self.setVariableValues(variableObj)

									self.timers['timer1'] = {
										onend: t1['IsOnEnd'],
										onovertime: t1['IsOnOvertime'],
										onalert: t1['IsOnAlert'],
										time: t1['CurrentTimeString'],
										name: t1['Name'],
										type: t1['TimerType'],
										enabled: t1['IsEnabled'],
										running: t1['IsRunning'],
									}

									self.timers['timer2'] = {
										onend: t2['IsOnEnd'],
										onovertime: t2['IsOnOvertime'],
										onalert: t2['IsOnAlert'],
										time: t2['CurrentTimeString'],
										name: t2['Name'],
										type: t2['TimerType'],
										enabled: t2['IsEnabled'],
										running: t2['IsRunning'],
									}

									self.checkFeedbacks()
								}
							})
							.catch(function (err) {
								self.log('error', 'Error during proccessing data', err)
							})
					}
				} catch (err) {
					console.error('Error handling socket data:', err)
				}
			})
		}
	},
}

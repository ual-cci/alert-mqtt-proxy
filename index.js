require('dotenv-safe').config();
const MQTT = require('async-mqtt');
const express = require('express');

const app = express();
app.listen(process.env.HTTP_PORT);

const client = MQTT.connect({
	host: process.env.MQTT_HOST,
	port: process.env.MQTT_PORT,
	username: process.env.MQTT_USER,
	password: process.env.MQTT_PASSWORD
});

// Log various connection states, no action
client.on('connect', () => {console.log('MQTT Connected')});
client.on('reconnect', () => {console.log('MQTT Reconnecting')});
client.on('close', () => {console.log('MQTT Closed')});
client.on('offline', () => {console.log('MQTT Offline')});
client.on('disconnect', () => {console.log('MQTT Disconnected')});
client.on('error', (e) => {console.log('MQTT Error:', e)});

// Send out a regular ping message
setInterval(() => {
	try {
		client.publish(`${process.env.MQTT_TOPIC}/ping`, `Hello, World!`);
	} catch (e) {
		console.log('Error', e)
	}
}, process.env.MQTT_PING_TIME);

app.get('/alert/:topic', (req, res) => {
	const subtopic = req.params.topic.toLowerCase();
	const topic = `${process.env.MQTT_TOPIC}/${subtopic}`
	const msg = req.query.msg;

	// Check message is only numbers, letters, hyphen or underscore
	// and is not more than 128 char
	// and isn't 'ping'
	if (!subtopic.match(/^([a-z0-9\-\_])+$/) || subtopic == 'ping' || subtopic.length > 128) {
		console.log('Error – Topic not valid:', subtopic, msg)
		return res.send('error - invalid topic')
	}

	// Check there is a message
	if (!msg) {
		console.log('Error – No message:', subtopic, msg)
		return res.send('error - no message')
	}

	// Check message length is reasonable
	if (msg.length > 1024) {
		console.log('Error – Message was too long:', subtopic)
		return res.send('error - message too long')
	}

	// Try to send the message
	try {
		client.publish(topic, msg);
		res.send('ok')
	} catch (e) {
		console.log('Error: ', e)
		res.send('error - server side')
	}
});
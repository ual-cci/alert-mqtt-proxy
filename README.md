<img src="https://github.com/ual-cci/alert-bot/raw/main/_assets/icon-transparent.png" height="150px" />

# Alert MQTT Proxy
Alert MQTT Proxy creates a very simple HTTP API that proxies MQTT messages.

Messages are sent to `http://localhost:3001/alert/topic?msg=Hello` where `topic` is the MQTT subtopic you want to post to, and `msg=` is suffixed by the URL encoded message you want to send in that topic.

## Validation of sub topics
1. Topics must be 128 characters or less.
2. Topics may only contain a-z, 0-9, as well as hypen and underscore.
3. There must be a topic.
4. All topics are forced into lowercase.

### Validation of messages:
1. Messages must be 512 characters or less.
2. There must be a message.

Messages are dispatched to the MQTT broker configured in the `.env` file and can be prefixed with a topic path, for example `MQTT_TOPIC=av` would mean that all proxied messages will end up inside `av/`, for example a HTTP request like `http://localhost:3001/alert/hh_302?msg=There%20is%20no%20sound.` would send the message "There is no sound." to `av/hh_302`.

## Success message
On successfully proxying a message the HTTP server will respond with `ok` in plain text.

## Error messages
If there is an error you will still get a 200 status code, but a plain text message as follows:

1. `error - invalid topic` – This means the topic has failed one of the above listed topic validation rules.
2. `error - no message` - This means there was no `msg` query string parameter, or it was empty.
3. `error - message too long` – This means the message was too long.
4. `error – server side` – This means the server was unable to send the message, probably because MQTT was down.

If you get any other message than these error codes something else is wrong.
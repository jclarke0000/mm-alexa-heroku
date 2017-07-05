
module.exports =
{
	
  processIntent: function(intent, callback) {

    var message = null;

    switch (intent.name) {
      case 'SwitchProfileIntent':
        message = {
          command: 'SWITCH_PROFILE',
          person: intent.slots.person.value
        };
        break;
      case 'SleepIntent':
        message = {
          command: 'SLEEP'
        };
        break;
      case 'ScreenSaverIntent':
        message = {
          command: 'SCREENSAVER'
        };
        break;
      case 'WakeUpIntent':
        message = {
          command: 'WAKE'
        };
        break;
      case 'ShutDownIntent':
        message = {
          command: 'SHUT_DOWN'
        };
        break;
    }

    if (message != null) {
      this.sendPNCommand (message, callback);
    }

  },
	
	sendPNCommand: function  (message, callback)
	{
		var PN = require("pubnub");
		var pn = new PN
		({
			ssl           : true,  // <- enable TLS Tunneling over TCP
			publish_key   : process.env.PUB_NUB_PUBLISH_KEY,
			subscribe_key : process.env.PUB_NUB_SUBSCRIBE_KEY
		});
		
		var output = message['message'];
		console.log ("Trying to send message");
		console.log ("Channel is: ", process.env.PUB_NUB_CHANNEL_KEY);
		pn.publish(
			{
				channel   : process.env.PUB_NUB_CHANNEL_KEY,
				message   : message
			},
			
			function (status, response)
			{
				console.log ("Callback fired");
				if (status.error)
				{
					console.log("Failed publish", status, response);
				}
				else
				{
					console.log("Succeedded publish", status, response);
				}
			}
		);
		console.log ("Sent messge, exepcted callback");
		//var speechletResponse = this.buildSpeechletResponse("My Home Title", output, "What else you want to do?", false);
		var sessionAttributes = {};
		//var resp = this.buildResponse(sessionAttributes, speechletResponse);
		console.log ("Finally calling back");
		//callback(null, resp);

    var alexaResponse;
    switch (message.command) {
      case 'SWITCH_PROFILE':
        if (message.person == 'undefined') {
          alexaResponse = "Sorry. There's no profile for that person.";
        } else {          
          alexaResponse = "OK. Here is " + message.person + "'s profile";
        }
        break;
      case 'SHUT_DOWN':
        alexaResponse = "OK. Shutting down.";
        break;
      case 'SLEEP':
        alexaResponse = "OK. Nighty night.";
        break;
      case 'WAKE':
        alexaResponse = "Hello!";
        break;
      default:
        alexaResponse = "OK";
    }

		callback
		(
			sessionAttributes,
			this.buildSpeechletResponse("My Home Title", alexaResponse, "", true)
		);
	},
	
	
	buildSpeechletResponse: function(title, output, repromptText, shouldEndSession)
	{
		console.log ("Building speechlet response");
		return(
		{
			'outputSpeech':
			{
				'type': 'PlainText',
				'text': output
			},
			'shouldEndSession': shouldEndSession
		});
	},

	buildResponse: function(sessionAttributes, speechletResponse)
	{
		console.log ("Building final response");
		console.log (speechletResponse);
		return {
			'version': '1.0',
			'sessionAttributes': sessionAttributes,
			'response': speechletResponse
		};
	}

	
} // end main 

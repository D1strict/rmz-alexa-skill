/* 
MIT License

Copyright (c) 2019 Dabble Lab

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const Alexa = require('ask-sdk-core');

const STREAMS = [
  {
    "token": "1",
    "url": 'https://stream.laut.fm/radio-marzahn?ref=alexa-own-radio-marzahn',
    "metadata" : {
      "title": "Radio Marzahn",
      "subtitle": "Radio Marzahn von laut.fm.",
      "art": {
        "sources": [
          {
            "contentDescription": "Logo",
            "url": "https://radio-marzahn.sirrobo-media.de/ad/pb_512.jpg",
            "widthPixels": 512,
            "heightPixels": 512
          }
        ]
      },
      "backgroundImage": {
        "sources": [
          {
            "contentDescription": "big logo",
            "url": "https://radio-marzahn.sirrobo-media.de/ad/banner.jpg",
            "widthPixels": 2560,
            "heightPixels": 1440
          }
        ]
      }
    }
  }
];

const PlayStreamIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest' ||
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
        (
          handlerInput.requestEnvelope.request.intent.name === 'PlayStreamIntent' ||
          handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ResumeIntent' ||
          handlerInput.requestEnvelope.request.intent.name === 'AMAZON.LoopOnIntent' ||
          handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NextIntent' ||
          handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PreviousIntent' ||
          handlerInput.requestEnvelope.request.intent.name === 'AMAZON.RepeatIntent' ||
          handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ShuffleOnIntent' ||
          handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StartOverIntent'
      );
  },
  handle(handlerInput) {

    let stream = STREAMS[0];

    handlerInput.responseBuilder
      .speak(`Du hörst ${stream.metadata.title} von laut f m.`)
      .addAudioPlayerPlayDirective('REPLACE_ALL', stream.url, stream.token, 0, null, stream.metadata);

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'Startet den Livestream von Radio Marzahn. Der lokale Radiosender mit Musik, Nachrichten und mehr.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

const AboutIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AboutIntent';
  },
  handle(handlerInput) {
    const speechText = 'Möchtest du weiterhören? Sage: fortfahren, oder sage, um zu stoppen: Stop.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && (
          handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent' ||
          handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PauseIntent' ||
          handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent' ||
          handlerInput.requestEnvelope.request.intent.name === 'AMAZON.LoopOffIntent' ||
          handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ShuffleOffIntent'
        );
  },
  handle(handlerInput) {

    handlerInput.responseBuilder
      .addAudioPlayerClearQueueDirective('CLEAR_ALL')
      .addAudioPlayerStopDirective();

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const PlaybackStoppedIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'PlaybackController.PauseCommandIssued' || 
            handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackStopped';
  },
  handle(handlerInput) {
    handlerInput.responseBuilder
      .addAudioPlayerClearQueueDirective('CLEAR_ALL')
      .addAudioPlayerStopDirective();

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const PlaybackStartedIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackStarted';
  },
  handle(handlerInput) {
    handlerInput.responseBuilder
      .addAudioPlayerClearQueueDirective('CLEAR_ENQUEUED');

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Dein Stream wurde mit folgendender Begründung beendet: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const ExceptionEncounteredRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'System.ExceptionEncountered';
  },
  handle(handlerInput) {
    console.log(`Dein Stream wurde mit folgendender Begründung beendet: ${handlerInput.requestEnvelope.request.reason}`);

    return true;
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Fehler: ${error.message}`);
    console.log(handlerInput.requestEnvelope.request.type);
    return handlerInput.responseBuilder
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    PlayStreamIntentHandler,
    PlaybackStartedIntentHandler,
    CancelAndStopIntentHandler,
    PlaybackStoppedIntentHandler,
    AboutIntentHandler,
    HelpIntentHandler,
    ExceptionEncounteredRequestHandler,
    SessionEndedRequestHandler
  )
 .addErrorHandlers(ErrorHandler)
  .lambda();
 

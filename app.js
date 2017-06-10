var util = require('util');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var applescript = require('applescript');

app.get('/speakers', function(req, res){
  var script = "" +
  "tell application \"Airfoil\"\n" +
  "set myspeakers to get every speaker\n" +
  "set allSpeakers to {}\n" +
  "repeat with currentSpeaker in myspeakers\n" +
  "  set thisSpeaker to {}\n" +
  "  set conn to connected of currentSpeaker\n" +
  "  copy conn to the end of thisSpeaker\n" +
  "  set volum to volume of currentSpeaker\n" +
  "  copy volum to the end of thisSpeaker\n" +
  "  set nm to name of currentSpeaker\n" +
  "  copy nm to the end of thisSpeaker\n" +
  "  set spkId to id of currentSpeaker\n" +
  "  copy spkId to the end of thisSpeaker\n" +
  "  set AppleScript's text item delimiters to \",\"\n" +
  "  set speakerText to thisSpeaker as text\n" +
  "  set AppleScript's text item delimiters to \"\"\n" +
  "  copy speakerText to the end of allSpeakers\n" +
  "end repeat\n" +
  "set AppleScript's text item delimiters to \"|\"\n" +
  "set speakerText to allSpeakers as text\n" +
  "set AppleScript's text item delimiters to \"\"\n" +
  "get speakerText\n" +
  "end tell";

  applescript.execString(script, function(error, result) {
    if (error) {
      res.json({error: error});
    } else {
      var speakers = [];
      var speakerText = result.split("|");
      speakerText.map(function(s) {
        var t = s.split(",");
        speakers.push({ connected: t[0], volume: parseFloat(t[1]), name: t[2], id: t[3] });
      });
      res.json(speakers);
    }
  });

});

app.get('/speakers/:id/status', function (req, res) {
  var script = "tell application \"Airfoil\"\n";
  script += "set myspeakers to get every speaker\n";
  script += "set speakerStatus to false\n";
  script += "set spkStatus to 0\n";
  script += "set thisSpeaker to \"" + req.params.id + "\"\n";
  script += "repeat with currentSpeaker in myspeakers\n";
  script += "if thisSpeaker is equal to name of currentSpeaker then set speakerStatus to connected of currentSpeaker\n";
  script += "end repeat\n";
  script += "if speakerStatus is true then set spkStatus to 1\n";
  script += "get spkStatus\n";
  script += "end tell";
  
  applescript.execString(script, function(error, result) {
    if (error) {
      res.json({error: error});
    } else {
      res.send("" + result);
    }
  });
});

app.get('/speakers/:id/volume', function (req, res) {
  var script = "tell application \"Airfoil\"\n";
  script += "set myspeakers to get every speaker\n";
  script += "set speakerVolume to 1\n";
  script += "set thisSpeaker to \"" + req.params.id + "\"\n";
  script += "repeat with currentSpeaker in myspeakers\n";
  script += "if thisSpeaker is equal to name of currentSpeaker then set speakerVolume to volume of currentSpeaker\n";
  script += "end repeat\n";
  script += "get round(speakerVolume * 100)\n";
  script += "end tell";
  
  applescript.execString(script, function(error, result) {
    if (error) {
      res.json({error: error});
    } else {
      res.send("" + result);
    }
  });
});

app.post('/speakers/:id/connect', function (req, res) {
  var script = "tell application \"Airfoil\"\n";
  script += "set myspeaker to first speaker whose name is \"" + req.params.id + "\"\n";
  script += "connect to myspeaker\n";
  script += "delay 0.5\n";
  script += "connected of myspeaker\n";
  script += "end tell";
  applescript.execString(script, function(error, result) {
    if (error) {
      res.json({error: error});
    } else {
      res.json({id: req.params.id, connected: result})
    }
  });
});

app.post('/speakers/:id/disconnect', function (req, res) {
  var script = "tell application \"Airfoil\"\n";
  script += "set myspeaker to first speaker whose name is \"" + req.params.id + "\"\n";
  script += "disconnect from myspeaker\n";
  script += "connected of myspeaker\n";
  script += "end tell";
  applescript.execString(script, function(error, result) {
    if (error) {
      res.json({error: error});
    } else {
      res.json({id: req.params.id, connected: result})
    }
  });
});

app.post('/speakers/:id/volume/:volume', function (req, res) {
  var script = "tell application \"Airfoil\"\n";
  script += "set myspeaker to first speaker whose name is \"" + req.params.id + "\"\n";
  script += "set (volume of myspeaker) to " + parseFloat(req.params.volume)*0.01 + "\n";
  script += "volume of myspeaker\n";
  script += "end tell";
  applescript.execString(script, function(error, result) {
    if (error) {
      res.json({error: error});
    } else {
      res.json({id: req.params.id, volume: parseFloat(result)})
    }
  });
});

app.post('/speakers/:id/volume', bodyParser.text({type: '*/*'}), function (req, res) {
  var script = "tell application \"Airfoil\"\n";
  script += "set myspeaker to first speaker whose id is \"" + req.params.id + "\"\n";
  script += "set (volume of myspeaker) to " + parseFloat(req.body) + "\n";
  script += "volume of myspeaker\n";
  script += "end tell";
  applescript.execString(script, function(error, result) {
    if (error) {
      res.json({error: error});
    } else {
      res.json({id: req.params.id, volume: parseFloat(result)})
    }
  });
});

app.listen(process.env.PORT || 8080);

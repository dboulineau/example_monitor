var EventEmitter = require('events').EventEmitter,
    util = require('util'),
    spawn = require('child_process').spawn,
    platform = require('os').platform,
    http = require('http');

var framegrab = function framegrab(options) {
  EventEmitter.call(this);

  options = options || {}

  this.apiResult = {};
  if (platform() == 'darwin') {
    this.cmd = 'imagesnap';
    this.cmdArgs = [
      '-q',
      '-w','1.5',
      'snapshot.png'
    ];
  }
  if (platform() == 'linux') {
    this.cmd = 'fswebcam';
    this.cmdArgs = [
      '-q',
      '-F','4',
      '--save','snapshot.png'
    ];
  }
  if (this.cmd == undefined) {
    throw "No grabber defined for " + platform();
  }

};

util.inherits(framegrab, EventEmitter);
module.exports = framegrab;

/**
framegrab.prototype.postVoiceData = function() {
  var self = this;

  var options = {
    hostname: 'www.google.com',
    path: '/speech-api/v1/recognize?xjerr=1&client=chromium&pfilter=0&maxresults=1&lang=' + self.apiLang,
    method: 'POST',
    headers: {
      'Content-type': 'audio/x-flac; rate=16000'
    }
  };

  var req = http.request(options, function(res) {
    self.recBuffer = [];
    if(res.statusCode !== 200) {
      return self.emit(
        'error',
        'Non-200 answer from Google Speech API (' + res.statusCode + ')'
      );
    }
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      self.apiResult = JSON.parse(chunk);
    });
    res.on('end', function() {
      self.parseResult();
    });
  });

  req.on('error', function(e) {
    self.emit('error', e);
  });

  // write data to request body
  console.log('Posting voice data...');
  for(var i in self.recBuffer) {
    if(self.recBuffer.hasOwnProperty(i)) {
      req.write(new Buffer(self.recBuffer[i],'binary'));
    }
  }
  req.end();
};
**/

framegrab.prototype.grab = function() {
  var self = this;

  var rec = spawn(self.cmd, self.cmdArgs, 'pipe');

  // Process stdout

  rec.stdout.on('readable', function() {
    self.emit('imageReadable');
  });

  // Process stdin

  rec.stderr.setEncoding('utf8');
  rec.stderr.on('data', function(data) {
    console.log(data)
  });

  rec.on('close', function(code) {
    self.recRunning = false;
    if(code) {
      self.emit('error', 'child exited with code ' + code);
    }
    self.emit('imageDone');
    // self.postVoiceData();
  });
}


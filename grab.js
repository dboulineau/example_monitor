var Grabber = require('./framegrab')


var grabber = new Grabber();

grabber.on('imageDone', function() {
  console.log('image is ready');
})

grabber.grab();

var nodemailer = require('nodemailer');
var fs=require('fs')
var Grabber = require('./framegrab')

var file = process.env.HOME + '/Dropbox/Home/control/cmds.txt'
var grabber = new Grabber()

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: '####################',
        pass: '' // app specific
    }
});

// NB! No need to recreate the transporter object. You can use
// the same transporter object for all e-mails

// setup e-mail data with unicode symbols
var mailOptions = {
    from: 'Me <dboulineau@gmail.com>', // sender address
    to: 'dboulineau@gmail.com', // list of receivers
    subject: 'snapshot', // Subject line
    text: 'Snapshot: ', // plaintext body
    attachments: [
      {
        filename: 'snapshot.png',
        content: fs.createReadStream('snapshot.png')
      }
    ]
};
grabber.on('imageDone', function() {
	console.log('An image is ready')
	mailOptions.subject = 'Snapshot from ' + new Date()
	transporter.sendMail(mailOptions, function(error, info){
	    if(error){
		console.log(error);
	    }else{
		console.log('Message sent: ' + info.response);
	    }
	});
})

function handleCommands(err, data) {
  if (err) {
    console.log(err);
    return;
  }
  console.log('Command: ' + data); 
grabber.grab();
  /** if (data.length > 0) {
     fs.truncate(file, 0);
   } **/
}
fs.watchFile(file, function(curr, prev) {
   console.log('the current mtime is: ' + curr.mtime);
   console.log('the previous mtime was: ' + prev.mtime);
   fs.readFile(file, handleCommands);
})

// send mail with defined transport object
/**
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
    }else{
        console.log('Message sent: ' + info.response);
    }
});

**/

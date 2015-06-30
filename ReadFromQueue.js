var sq = require('simplequeue');
var client = sq.createRemoteClient();


function Consumer(queue) {
    var self = this;
    this.process = function() {
        queue.getMessage(function (err, msg) {
            if (err) {
                console.log(err);
            }
            else if (msg != null) {
				//JSON.parse(msg);
                console.log(msg);
            }
				process.nextTick(self.process);
        });
	}
}

client.on('remote', function (remote) {
	remote.getQueue('can_messages_queue', function (err, queue) {
		if (err) {
			console.log(err);
			process.exit(1);
		}
	(new Consumer(queue)).process();
	});
});


client.connect(3001);

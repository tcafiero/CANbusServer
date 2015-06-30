//var start = Date.parse("April 7, 2015");
//var end = Date.parse("April 7, 2015");
var d = new Date();
var start;
var serialport = require("serialport")
var port = process.argv[2];
var comport = process.argv[3]
var baudrate = process.argv[4];
var SerialPort = serialport.SerialPort;
//var serialPort = new SerialPort("/dev/tty-usbserial1", {
//var sp = new SerialPort("COM21", {
var sp = new SerialPort(comport, {
    baudrate: baudrate,
    //		baudrate : 921600,
    parser: serialport.parsers.readline("\n")
}, false); // this is the openImmediately flag [default is true]
var request = require('request'),
    options = {
        //  host: "localhost",
        //  port: 5984,
        //  path: "/can_messages",
        headers: {
            "content-type": "application/json"
        },
        method: "POST",
        uri: 'http://localhost:5984/can_messages/',
        json: true,
        body: ""
    };

/*
 if (!String.prototype.trim) {
 //code for trim
 String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g, '');};
 }
 */

var express = require('express')
var app = express()
var sq = require('simplequeue');
var client = sq.createRemoteClient();
var queue_on = false;
var my_queue;

client.on('remote', function (remote) {
    remote.createQueue('can_messages_queue', function (err, queue) {
        if (err) {
            console.log(err);
            process.exit(1);
        }
        console.log("queue client on")
        start = d.getTime();
        queue.putMessage("{ \"SessionDate\": \"" + Date() + "\"}");
        queue_on = true;
        my_queue = queue;
    });
});

app.get('/can_messages/', function (req, res) {
    res.send('CAN BUS service activated.');
    sp.open(function (error) {
        if (error) {
            console.log('failed to open: ' + error);
        } else {
            sp.on('data', function (data) {
                var v = new Date();
                var line = "{ \"Time\": \"" + (v.getTime() - start) + "\", " + String(data).trim() + "}";
                // line += String(data).trim();
                // line += "}";
                //JSON.parse(line);
                if (queue_on)
                    my_queue.putMessage(line);
            });
        }
    });
})

app.delete('/can_messages/', function (req, res) {
    queue_on = false;
    res.send('CAN BUS service suspended.');
});

app.put('/can_messages/', function (req, res) {
    queue_on = true;
    res.send('CAN BUS service resumed.');
});

app.listen(port)
client.connect(3001);


Web Application for RobAir - Fablab
====
02/04/2015 - Ensimag students


TODO archi tu projet :

This project contains a WebRTC connection:
* WebRTC video-chat : 
    * the module signalingserver launches the communication between the two WebRTC clients (the robot and the suser)
    * the module server enables the WebRTC communication
* The part to control the robot:
    * direction to move the robot
    * gets the signals from the robots

This project is based on the MVCB project (see below).

TODO modifier launch.sh et install.sh si nécessaire après intégration de ROS etc

MVCB
====

Mosaic Video Channel for Buddies -
Grenoble INP-ENSIMAG school project.

A web application dedicated to offer a video conference platform, using WebRTC technology, for fablabs.
This project also uses `node.js` (`node`, `npm`), and uses [simpleWebRTC](https://github.com/HenrikJoreteg/SimpleWebRTC) to encapsulate the management of WebRTC tools. We are willing to move into our own WebRTC implementation sometime soon.

Don't forget to run `npm install`:
* `cd MVCB/server`
* `npm install`
You need to perform the same in the signalingserver folder. You can also directly use the bash exec :
* `$ ./install.sh`

How to start the server :
* `$ cd MVCB/`
* `$ cd server`
* `$ node server.js`
* `$ node ../signalingserver/server.js`
You can also directly use the bash exec :
* `$ ./launch.sh`

You might also need a stunt server but we'll explain this in more detail later.

How to locally launch the web page :
* `$ chromium-browser http://localhost:8081/`

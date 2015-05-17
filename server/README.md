Partie principale de l'application web
* views/ : les vues 
    * layout, layout_user et layout_robot forme le bande à gauche (panneau bleu pour changer de room)
	* room_user et room_robot sont les vues principales où sont affichées les vidéos. Room_user contient en plus les panneaux pour contrôler le robot et visualiser les différents capteurs en provenance du robot.
* js/ : les fichiers javascript
	* rosManagement.js contient le code pour communiquer avec le robot via des topics ROS
	* videoManagementRobot.js et videoManagementUser.js contient le code pour démarrer la connexion WebRTC du côté robot et du côté utilisateur


Configuration du serveur pour la connexion WebRTC
===================================================

Pour lancer le serveur executer :
node server.js

Nécessite le(s) module(s) nodejs suivant :
- express

On accède ensuite au serveur via l'adresse :
http://localhost:8087
-> dépend du port spécifié dans server.js

Pour que la connexion WebRTC s'effectue, il faut 
* lancer le serveur de signaling (node ../signalingserver/server.js) 
* changer l'url dans la partie "config" dans js/simplewebrtc.bundle.js par l'adresse IP où tourne le serveur de signaling (adresse IP du robot donc).  ( url:'http://adresse_IP_Robot:8088' )


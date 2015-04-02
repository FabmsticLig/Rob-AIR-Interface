Partie principale de l'application web
* views/ : les vues 
    * layout/layout_user et layout_robot forme le bande à gauche (panneau bleu pour changer de room)
	* room.html est la vue principale où sont affichées les vidéo -> c'est là que l'on va intégrer les autres panneaux



Configuration du serveur pour la connexion WebRTC
===================================================

Pour lancer le serveur executer :
node server.js

Nécessite le(s) module(s) nodejs suivant :
- express

On accède ensuite au serveur via l'adresse :
http://localhost:8087
-> dépend du port spécifié dans server.js


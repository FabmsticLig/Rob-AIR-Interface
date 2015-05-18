#! /bin/bash

echo -e "Lancement des serveurs"
cd server
nodejs server.js &
sleep 3
nodejs ../signalingserver/server.js &

echo -e "Serveur lancé"
namevariable=$(uname)

echo "$namevariable"
echo -e "Fin du programme"

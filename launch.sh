#! /bin/bash

echo -e "Lancement des serveurs"
cd server
node server.js &
sleep 3
node ../signalingserver/server.js &

echo -e "Serveur lancé"
namevariable=$(uname)

echo "$namevariable"
echo -e "Fin du programme"

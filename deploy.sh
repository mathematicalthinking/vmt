#!/bin/bash
echo -e "\e[1;33m Making a production build"
echo -e "\e[1;30m"
if [ -d "./client/build" ]; then
  rm -rf ./client/build
fi
npm run build-$2
if [ -d "./client/encompassBuild" ]; then
  rm -rf ./client/encompassBuild
fi
npm run build-enc-$2
if [ -d "./$2" ]; then
  rm -rf ./$2
fi
mkdir ./$2
cp -r ./bin ./config ./controllers ./middleware ./models ./routes ./constants ./db_migration ./$2
cp app.js package.json socketInit.js sockets.js .env ./$2
cd $2
mkdir client
cp -r ../client/build/ ../client/encompassBuild/ ./client/

echo -e "\e[1;33m Zipping...\e[0m"
zip -r VMT-$2.zip .
echo -e "\e[1;33m Copying zipped directory...\e[0m"
scp ./VMT-$2.zip "$1"@mathematicalthinking.org:/tmp/
echo -e "\e[1;31m You're not done yet!\e[0m"
echo -e "\e[1;35m run the following commands to complete the demployment proces"
echo -e "\e[1;34m $ \e[0m ssh $1@mathematicalthinking"
echo -e "\e[1;34m $ \e[0m cd /home/$1"
echo -e "\e[1;34m $ \e[0m su root"
echo -e "\e[1;34m $ \e[0m bash deploy-$2-2"

#!/bin/bash
echo -e "\e[1;33m Making a $2 build"
echo -e "\e[1;30m"
if [ -d "./client/build" ]; then
  rm -rf ./client/build
fi
if [ -d "./client/encompassBuild" ]; then
  rm -rf ./client/encompassBuild
fi
cd ./server
npm run build-$2
npm run build-enc-$2
cd ..
if [ -d "./$2" ]; then
  rm -rf ./$2
fi
mkdir ./$2
cd ./$2
mkdir ./server
cd ..
echo "made $2 directory"
cd ./server
cp -r ./bin ./config ./constants ./controllers ./db_migration ./middleware ./models ./routes ./services ../$2/server
echo "\e[1;33m server copied to $2"
cp app.js package.json socketInit.js sockets.js ../$2/server
cp .env ../$2
echo "\e[1;33mfiles copied"
cd ../$2
mkdir client
mkdir client/build
mkdir client/encompassBuild

cp -r ../client/build/ client/build
cp -r ../client/encompassBuild/ client/encompassBuild

echo -e "\e[1;33m Zipping...\e[0m"
zip -r VMT-$2.zip .
echo -e "\e[1;33m Copying zipped directory...\e[0m"
scp ./VMT-$2.zip "$1"@mathematicalthinking.org:/tmp/
echo -e "\e[1;31m You're not done yet!\e[0m"
echo -e "\e[1;35m run the following commands to complete the demployment proces"
echo -e "\e[1;34m $ \e[0m ssh $1@mathematicalthinking"
echo -e "\e[1;34m $ \e[0m cd /web/mathematicalthinking/vmt"
echo -e "\e[1;34m $ \e[0m rm -rf staging && mkdir staging && cd staging"
echo -e "\e[1;34m $ \e[0m mv /tmp/VMT-$2.zip ."
echo -e "\e[1;34m $ \e[0m unzip VMT-$2.zip"
echo -e "\e[1;34m $ \e[0m cd ./server && npm install --only=production"
echo -e "\e[1;34m $ \e[0m systemctl restart vmt-$2"

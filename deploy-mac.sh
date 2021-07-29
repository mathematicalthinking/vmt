#!/bin/bash
echo -e "\e[1;33m Making a $1 build"
echo -e "\e[1;30m"
if [ -d "./client/build" ]; then
  rm -rf ./client/build
fi
if [ -d "./client/encompassBuild" ]; then
  rm -rf ./client/encompassBuild
fi
cd ./server
npm run build-$1
# npm run build-enc-$1
cd ..
if [ -d "./$1" ]; then
  rm -rf ./$1
fi
mkdir ./$1
cd ./$1
mkdir ./server
cd ..
echo "made $1 directory"
cd ./server
cp -r ./bin ./config ./constants ./controllers ./db_migration ./middleware ./models ./routes ./services ../$1/server
echo "\e[1;33m server copied to $1"
cp app.js package.json socketInit.js sockets.js ../$1/server
cp .env ../$1
echo "\e[1;33mfiles copied"
cd ../$1
mkdir client
mkdir client/build
# mkdir client/encompassBuild

cp -r ../client/build/ client/build
# cp -r ../client/encompassBuild/ client/encompassBuild

echo -e "\e[1;33m Zipping...\e[0m"
zip -r VMT-$1.zip .
echo -e "\e[1;33m Copying zipped directory...\e[0m"
# scp ./VMT-$1.zip "$1"@mathematicalthinking.org:/tmp/
# echo -e "\e[1;31m You're not done yet!\e[0m"
# echo -e "\e[1;35m run the following commands to complete the demployment proces"
# echo -e "\e[1;34m $ \e[0m ssh $1@mathematicalthinking"
# echo -e "\e[1;34m $ \e[0m cd /web/mathematicalthinking/vmt"
# echo -e "\e[1;34m $ \e[0m rm -rf staging && mkdir staging && cd staging"
# echo -e "\e[1;34m $ \e[0m mv /tmp/VMT-$1.zip ."
# echo -e "\e[1;34m $ \e[0m unzip VMT-$1.zip"
# echo -e "\e[1;34m $ \e[0m cd ./server && npm install --only=production"
# echo -e "\e[1;34m $ \e[0m systemctl restart vmt-$1"

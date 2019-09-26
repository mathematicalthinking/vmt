#!/bin/bash
branch=$1
githubAccount=$2

if [ $# -eq 0 ]
  then
  branch="master"
  githubAccount="mathematicalthinking"
fi

if [ $# -eq 1 ]
  then
  githubAccount="mathematicalthinking"
fi

echo "Branch: $branch"
echo "Account: $githubAccount"
  # clone mt-sso
  cd ..
  git clone --branch=$branch https://github.com/$githubAccount/mt-sso.git mt-sso
  cd mt-sso
  ~/.nvm/nvm.sh install 8.6.0
  ~/.nvm/nvm.sh use 8.6.0
  npm i
  npm run test-travis &
  sleep 5

  # clone enc
  cd ..
  git clone --branch=$branch https://github.com/$githubAccount/encompass.git encompass
  cd encompass && npm i --only=production
  npm run test-travis &
  sleep 6
  cd ../vmt

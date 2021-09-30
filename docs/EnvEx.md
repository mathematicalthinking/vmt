# VMT (Virutal Math Teams) Env Guide

Below are examples intended to help in configuring the .env files for VMT. Remove placeholders as needed for deployment. A couple of points:

- the various JWT variables need to match up among client, server, and MT-SSO
- to do cypress testing, MT-SSO will need a .env_test file, which sets the regular MT-SSO variables to values that correspond with the 'test' variables in the client or server. For example, REACT_APP_MT_LOGIN_URL_TEST points to localhost:3003. This means that the SSO_PORT in .env_test should be set to 3003.

## 1. Client

### .env in the 'client' directory

REACT_APP_SERVER_URL_PRODUCTION='https://vmt.mathematicalthinking.org'
REACT_APP_SERVER_URL_STAGING='https://vmt-test.mathematicalthinking.org'
REACT_APP_SERVER_URL_DEV='http://localhost:3000'
REACT_APP_SERVER_URL_ENCOMPASS_PRODUCTION='http://localhost:3001'
REACT_APP_ENCOMPASS_URL_DEV='http://localhost:8080'
REACT_APP_ENCOMPASS_URL_STAGING='https://enc-test.mathematicalthinking.org'
REACT_APP_ENCOMPASS_URL_PRODUCTION='https://encompass.mathematicalthinking.org'
REACT_APP_MT_LOGIN_URL_DEV='http://localhost:3002'
REACT_APP_MT_LOGIN_URL_STAGING='https://sso-test.mathematicalthinking.org'
REACT_APP_MT_LOGIN_URL_PRODUCTION='https://sso.mathematicalthinking.org'
REACT_APP_MT_LOGIN_URL_TEST='http://localhost:3003'
REACT_APP_GEOGEBRA_VERSION=5.0.570.0

## 2. Server

### .env in the 'server' directory

MONGO_DEV_URI='mongodb://localhost/vmt'
MONGO_TEST_URI='mongodb://localhost/vmt-test'
MONGO_STAGING_URI='mongodb://localhost/vmt_staging'
MONGO_PROD_URI='mongodb://localhost/vmt_prod'

MT_USER_JWT_SECRET='##jwtplaceholder##'
MT_USER_JWT_SECRET_TEST=##testjwtsecretplaceholder##
MT_SSO_URL_DEV=http://localhost:3002
MT_SSO_URL_STAGING=https://sso-test.mathematicalthinking.org
MT_SSO_URL_PROD=http://localhost:1343
MT_SSO_URL_TEST=http://localhost:3003

JWT_ISSUER_ID_DEV=##jwtDEVplaceholder##
JWT_ISSUER_ID_TEST=##jwtTESTplaceholder##
JWT_ISSUER_ID_STAGING=##jwtSTAGEplaceholder##
JWT_ISSUER_ID_PROD=##jwtPRODplaceholder##

MT_SSO_JWT_ISSUER_ID_DEV=##jwtDEVplaceholder##
MT_SSO_JWT_ISSUER_ID_TEST=##jwtTESTplaceholder##
MT_SSO_JWT_ISSUER_ID_STAGING=##jwtSTAGEplaceholder##
MT_SSO_JWT_ISSUER_ID_PROD=##jwtPRODplaceholder##
SSO_COOKIE_DOMAIN=mathematicalthinking.org

ENC_URL_TEST=http://localhost:8082
ENC_URL_DEV=http://localhost:8080
ENC_URL_STAGING=https://enc-test.mathematicalthinking.org
ENC_URL_PROD=http://localhost:1339
ENC_JWT_ISSUER_ID_DEV=##jwtDEVplaceholder##
ENC_JWT_ISSUER_ID_TEST=##jwtTESTplaceholder##
ENC_JWT_ISSUER_ID_STAGING=##jwtSTAGEplaceholder##
ENC_JWT_ISSUER_ID_PROD=##jwtPRODplaceholder##

## 2. MT-SSO

### .env in the 'mt-sso' directory

MT_USER_JWT_SECRET=-'##jwtplaceholder##'
JWT_ISSUER_ID=#testjwtsecretplaceholder##
MT_DB_URI=mongodb://localhost:27017/mtlogin
DEFAULT_REDIRECT_URL=https://mathematicalthinking.org

ENC_URL=http://localhost:8080
ENC_PATH_TO_MODELS=../../encompass/server/datasource/schemas
ENC_GMAIL_USERNAME=(placeholder)@gmail.com
ENC_GMAIL_PASSWORD=(pass)
ENC_JWT_ISSUER_ID=##jwtplaceholder##
ENC_OAUTH_FAILURE_REDIRECT_PATH=/#/auth/
ENC_DB_URI=mongodb://localhost:27017/encompass

VMT_URL=http://localhost:3000
VMT_PATH_TO_MODELS=../../vmt/models
VMT_GMAIL_USERNAME=(placeholder)@gmail.com
VMT_GMAIL_PASSWORD=(placeholder)
VMT_JWT_ISSUER_ID=##jwtplaceholder##
VMT_OAUTH_FAILURE_REDIRECT_PATH=/auth/login
VMT_OAUTH_SUCCESS_REDIRECT_PATH=/oauth/return
VMT_DB_URI=mongodb://localhost:27017/vmt

GOOGLE_CLIENT_ID=(GClientplaceholder)
GOOGLE_CLIENT_SECRET=(GClintsecret)
GOOGLE_CALLBACK_URL=http://localhost:3002/oauth/google/callback

SSO_PORT=3002
NODE_ENV=development

SSO_COOKIE_DOMAIN=localhost

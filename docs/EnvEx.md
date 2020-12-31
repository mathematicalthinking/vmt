# VMT (Virutal Math Teams) Env Guide

Below are examples intended to help in configuring the .env files for VMT.

## 1. Client

### .env in the 'clent' directory

REACT*APP_SERVER_URL_PRODUCTION='\_url.com*'
REACT*APP_SERVER_URL_STAGING='\_url.com*'
REACT*APP_SERVER_URL_DEV='http://localhost:\_xxxx*'
REACT*APP_SERVER_URL_ENCOMPASS_PRODUCTION='http://localhost:\_xxxx*'
REACT*APP_ENCOMPASS_URL_DEV='http://localhost:\_xxxx*'
REACT*APP_ENCOMPASS_URL_STAGING='\_url.com*'
REACT*APP_ENCOMPASS_URL_PRODUCTION='\_url.com*'
REACT*APP_MT_LOGIN_URL_DEV='http://localhost:\_xxxx*'
REACT*APP_MT_LOGIN_URL_STAGING='\_url.com*'
REACT*APP_MT_LOGIN_URL_PRODUCTION='\_url.com*'
REACT*APP_MT_LOGIN_URL_TEST='http://localhost:\_xxxx*'
REACT_APP_GEOGEBRA_VERSION=5.0.570.0

## 2. Client

### .env in the 'clent' directory

MONGO*DEV_URI='mongodb://localhost/\_db_name*'
MONGO*TEST_URI='mongodb://localhost/\_db_name*'
MONGO*STAGING_URI='mongodb://localhost/\_db_name*'
MONGO*PROD_URI='mongodb://localhost/\_db_name*'

MT*USER_JWT_SECRET='\_yyyyy*'
MT*USER_JWT_SECRET_TEST=\_yyyyy*
MT*SSO_URL_DEV=http://localhost:\_xxxx*
MT*SSO_URL_STAGING=\_url.com*
MT*SSO_URL_PROD=http://localhost:\_xxxx*
MT*SSO_URL_TEST=http://localhost:\_xxxx*

JWT*ISSUER_ID_DEV=\_yyyyy*
JWT*ISSUER_ID_TEST=\_yyyyy*
JWT*ISSUER_ID_STAGING=\_yyyyy*
JWT*ISSUER_ID_PROD=\_yyyyy*

MT*SSO_JWT_ISSUER_ID_DEV=\_yyyyy*
MT*SSO_JWT_ISSUER_ID_TEST=\_yyyyy*
MT*SSO_JWT_ISSUER_ID_STAGING=\_yyyyy*
MT*SSO_JWT_ISSUER_ID_PROD=\_yyyyy*
SSO*COOKIE_DOMAIN=\_url.com*

ENC*URL_TEST=http://localhost:\_xxxx*
ENC*URL_DEV=http://localhost:\_xxxx*
ENC*URL_STAGING=\_url.com*
ENC*URL_PROD=http://localhost:\_xxxx*
ENC*JWT_ISSUER_ID_DEV=\_yyyyy*
ENC*JWT_ISSUER_ID_TEST=\_yyyyy*
ENC*JWT_ISSUER_ID_STAGING=\_yyyyy*
ENC*JWT_ISSUER_ID_PROD=\_yyyyy*

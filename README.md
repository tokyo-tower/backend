<img src="https://motionpicture.jp/images/common/logo_01.svg" alt="motionpicture" title="motionpicture" align="right" height="56" width="98"/>

# TTTSマスター管理ウェブアプリケーション

[![CircleCI](https://circleci.com/gh/motionpicture/ttts-backend.svg?style=svg&circle-token=bf5763849fc394f581d0a8eaf4c841bbdfc1cd93)](https://circleci.com/gh/motionpicture/ttts-backend)


## Table of contents

* [Usage](#usage)
* [Jsdoc](#jsdoc)
* [License](#license)

## Usage

### Environment variables

| Name                              | Required | Value          | Purpose                               |
| --------------------------------- | -------- | -------------- | ------------------------------------- |
| `DEBUG`                           | false    | ttts-backend:* | Debug                                 |
| `NPM_TOKEN`                       | true     |                | NPM auth token                        |
| `NODE_ENV`                        | true     |                | 環境名(development,test,productionなど) |
| `API_ENDPOINT`                    | true     |                | APIエンドポイント                            |
| `API_CLIENT_ID`                   | true     |                | APIクライアントID                           |
| `API_CLIENT_SECRET`               | true     |                | APIクライアントシークレット                       |
| `API_AUTHORIZE_SERVER_DOMAIN`     | true     |                | API認可サーバードメイン                       |
| `API_RESOURECE_SERVER_IDENTIFIER` | true     |                | APIリソースサーバー識別子                     |
| `REDIS_HOST`                      | true     |                | redis host                            |
| `REDIS_PORT`                      | true     |                | redis port                            |
| `REDIS_KEY`                       | true     |                | redis key                             |
| `MONGOLAB_URI`                    | true     |                | mongodb接続URI                        |
| `POS_CLIENT_ID`                   | true     |                | POSクライアントID                           |


## Jsdoc

`npm run doc` emits jsdoc to ./doc.

## License

UNLICENSED

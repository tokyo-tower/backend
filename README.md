# TTTS Backend

[![CircleCI](https://circleci.com/gh/motionpicture/ttts-backend.svg?style=svg&circle-token=bf5763849fc394f581d0a8eaf4c841bbdfc1cd93)](https://circleci.com/gh/motionpicture/ttts-backend)


## Table of contents

* [Usage](#usage)
* [License](#license)

## Usage

### Environment variables

| Name                              | Required | Value          | Purpose                                       |
| --------------------------------- | -------- | -------------- | --------------------------------------------- |
| `DEBUG`                           | false    | ttts-backend:* | Debug                                         |
| `NODE_ENV`                        | true     |                | 環境名                                        |
| `API_ENDPOINT`                    | true     |                | APIエンドポイント                             |
| `API_CLIENT_ID`                   | true     |                | APIクライアントID                             |
| `API_CLIENT_SECRET`               | true     |                | APIクライアントシークレット                   |
| `API_AUTHORIZE_SERVER_DOMAIN`     | true     |                | API認可サーバードメイン                       |
| `API_RESOURECE_SERVER_IDENTIFIER` | true     |                | APIリソースサーバー識別子                     |
| `CINERINO_API_ENDPOINT`           | true     |                | Cinerino API Endpoint                         |
| `REDIS_HOST`                      | true     |                | redis host                                    |
| `REDIS_PORT`                      | true     |                | redis port                                    |
| `REDIS_KEY`                       | true     |                | redis key                                     |
| `POS_CLIENT_ID`                   | true     |                | POSクライアントID                             |
| `TOP_DECK_OPEN_DATE`              | true     |                | トップデッキオープン日時(ISO8601フォーマット) |
| `RESERVATION_START_DATE`          | true     |                | 予約開始日時(ISO8601フォーマット)             |

## License

ISC

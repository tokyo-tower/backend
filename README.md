# CHEVREマスター管理ウェブアプリケーション

# Features

# Getting Started

## インフラ
基本的にnode.jsのウェブアプリケーションです。
ウェブサーバーとしては、AzureのWebAppsあるいはGCPのAppEngineを想定しており、両方で動くように開発していくことが望ましい。

## 言語
実態としては、linuxあるいはwindows上でnode.jsは動くわけですが、プログラミング言語としては、alternative javascriptのひとつであるTypeScriptを採用しています。

* TypeScript(https://www.typescriptlang.org/)

## 開発方法
npmでパッケージをインストールします。npmはnode.jsでスタンダードなパッケージ管理ツールです。パッケージ管理にとどまらず、開発やサーバー起動においても活躍します。

```shell
npm install
```
* npm(https://www.npmjs.com/)

typescriptをjavascriptにコンパイルします。wオプションでファイル変更監視できます。

```shell
npm run build -- -w
```

npmでローカルサーバーを立ち上げることができます。

```shell
npm start
```
(http://localhost:8081)にアクセスすると、ローカルでウェブアプリを確認できます。

ビルドファイルクリーン

```shell
npm run clean
```

scssビルド

```shell
npm run css
```


## Required environment variables
```shell
set NODE_ENV=**********環境名(development,test,production)**********
set SENDGRID_API_KEY=**********sendgrid api key**********
set CHEVRE_PERFORMANCE_STATUSES_REDIS_HOST=**********パフォーマンス空席状況保管先redis host**********
set CHEVRE_PERFORMANCE_STATUSES_REDIS_PORT=**********パフォーマンス空席状況保管先redis port**********
set CHEVRE_PERFORMANCE_STATUSES_REDIS_KEY=**********パフォーマンス空席状況保管先redis key**********
set REDIS_HOST=**********session保管先redis host**********
set REDIS_PORT=**********session保管先redis port**********
set REDIS_KEY=**********session保管先redis key**********
set MONGOLAB_URI=**********mongodb接続URI**********
```

only on Aure WebApps

```shell
set WEBSITE_NODE_DEFAULT_VERSION=**********node.jsバージョン**********
set WEBSITE_TIME_ZONE=Tokyo Standard Time
```

デバッグしたい場合

```shell
set DEBUG=chevre-backend*
```

ベーシック認証をかけたい場合

```shell
set CHEVRE_BACKEND_BASIC_AUTH_NAME=**********認証ユーザー名**********
set CHEVRE_BACKEND_BASIC_AUTH_PASS=**********認証パスワード**********
```


# tslint

コード品質チェックをtslintで行っています。lintパッケージとして以下を仕様。
* [tslint](https://github.com/palantir/tslint)
* [tslint-microsoft-contrib](https://github.com/Microsoft/tslint-microsoft-contrib)
`npm run check`でチェック実行。改修の際には、必ずチェックすること。

# test
mochaフレームワークでテスト実行。
* [mocha](https://www.npmjs.com/package/mocha)
`npm test`でテスト実行

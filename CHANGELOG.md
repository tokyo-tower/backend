# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/).

## Unreleased

### Added

### Changed

- install @motionpicture/ttts-domain@15.x.x

### Deprecated

### Removed

### Fixed

### Security

## v3.0.0 - 2019-06-05

### Changed

- update typescript
- install @motioinpicture/ttts-domain@14.x.x

### Removed

- マスタ管理ルーター削除
- jsdoc削除

## v2.2.2 - 2018-12-22

### Changed

- 社名変更に伴うロゴ変更

## v2.2.1 - 2018-11-28

### Changed

- 取引と予約の検索パフォーマンス向上
- 売上レポート画面を簡素化

## v2.2.0 - 2018-06-23

### Added

- 日次集計済みデータダウンロード機能追加。
- 既存クエリのチューニング。

## v2.1.0 - 2018-04-17

### Added

- 来塔予定日による売り上げレポート出力機能を追加。

## v2.0.4 - 2018-03-28

### Changed

- POS購入除外機能をオフにする対応。
- トップデッキオープン前のPOS購入をレポートから除外する対応。
- 予約開始前の取引をレポートから除外する対応。

## v2.0.3 - 2018-02-14
### Changed
- POSでの注文取引をレポートから除外。

### Fixed
- 取引データに予約の入場情報は同期できていないので、レポート作成に予約データを使用するように変更。

## v2.0.2 - 2018-01-25
### Fixed
- csv_codeマスターデータの設定ミスをカバリングするようにcsvデータを調整。

## v2.0.1 - 2018-01-24
### Fixed
- csvのキャンセル手数料を購入単位で出力するように修正。

## v2.0.0 - 2018-01-21
### Changed
- ttts-domain@12.0.0でニューリリース。
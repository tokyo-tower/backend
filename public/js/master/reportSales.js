$(function () {
    // datepickerセット
    $('.datepicker').datepicker({
        language: 'ja'
    })

    // レポート出力ボタンイベント
    var conditions = {};
    $(document).on('click', '.btn-ok', function () {
        var now = (new Date()).getTime();
        var url = '/master/report/getSales/' + '?dummy=' + now;
        window.open(url);
    });
});
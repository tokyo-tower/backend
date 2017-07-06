$(function () {
    // datepickerセット
    $('.datepicker').datepicker({
        language: 'ja'
    })

    // レポート出力ボタンイベント
    $(document).on('click', '.btn-ok', function () {
        var dateFrom = $('input[name="dateFrom"]').val();
        var dateTo = $('input[name="dateTo"]').val();
        var now = (new Date()).getTime();
        var url = '/master/report/getSales/' + 
            '?dateFrom=' + dateFrom + '&dateTo=' + dateTo +'&dummy=' + now;
        window.open(url);
    });
});
$(function () {
    // datepickerセット
    $('.datepicker').datepicker({
        language: 'ja'
    })

    var getValue = function(selector){
        return ($(selector).length > 0) ? $(selector).val() : '';
    }

    // レポート出力ボタンイベント
    $(document).on('click', '.btn-ok', function () {
        var dateFrom = getValue('input[name="dateFrom"]');
        var dateTo = getValue('input[name="dateTo"]');
        // for account report
        var owner = getValue('select[name="owner"]');
        var start_hour1 = getValue('select[name="start_hour1"]');
        var start_minute1 = getValue('select[name="start_minute1"]');
        var start_hour2 = getValue('select[name="start_hour2"]');
        var start_minute2 = getValue('select[name="start_minute2"]');
        // now:キャッシュ避け
        var now = (new Date()).getTime();
        var url = '/master/report/getSales/' + 
            '?dateFrom=' + dateFrom + '&dateTo=' + dateTo +
            '&owner=' + owner +
            '&start_hour1=' + start_hour1 + '&start_minute1=' + start_minute1 +
            '&start_hour2=' + start_hour2 + '&start_minute2=' + start_minute2 +
            '&dummy=' + now;
        window.open(url);
    });
});
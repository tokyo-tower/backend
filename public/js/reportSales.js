$(function () {
    // datepickerセット
    $('.datepicker').datepicker({
        language: 'ja'
    });

    var getValue = function (selector) {
        return ($(selector).length > 0) ? $(selector).val() : '';
    };

    // レポート出力ボタンイベント
    $(document).on('click', '.btn-ok', function () {
        var dateFrom = getValue('input[name="dateFrom"]');
        var dateTo = getValue('input[name="dateTo"]');
        // for account report
        var start_hour1 = getValue('select[name="start_hour1"]');
        var start_minute1 = getValue('select[name="start_minute1"]');
        var start_hour2 = getValue('select[name="start_hour2"]');
        var start_minute2 = getValue('select[name="start_minute2"]');
        // レポート区分
        var reportType = getValue('input[name="reportType"]');
        // now:キャッシュ避け
        var now = (new Date()).getTime();
        var url = '/reports/getSales/' +
            '?dateFrom=' + dateFrom + '&dateTo=' + dateTo +
            '&start_hour1=' + start_hour1 + '&start_minute1=' + start_minute1 +
            '&start_hour2=' + start_hour2 + '&start_minute2=' + start_minute2 +
            '&reportType=' + reportType +
            '&dummy=' + now;
        console.log('[donwload] sales report', url);
        window.open(url);
    });


    // アカウント別レポートダウンロード
    var btn_download_accountreport = document.getElementById('btn_download_accountreport');
    var select_account = document.getElementById('select_account');
    if (!btn_download_accountreport || !select_account) { return false; }
    var acCondition = {};
    $('#input_reportrange').daterangepicker({
        timePicker: true,
        timePicker24Hour: true,
        autoUpdateInput: false, // 空欄状態を作るためにfalse
        locale: {
            applyLabel: '決定',
            cancelLabel: '取消',
            format: 'YYYY/MM/DD HH:mm'
        }
    }).on('apply.daterangepicker', function (ev, pckr) {
        acCondition.dateFrom = pckr.startDate.format('YYYY/MM/DD');
        acCondition.dateTo = pckr.endDate.format('YYYY/MM/DD');
        acCondition.start_hour1 = pckr.startDate.format('HH') + '&start_minute1=' + pckr.startDate.format('mm');
        acCondition.start_hour2 = pckr.endDate.format('HH') + '&start_minute2=' + pckr.endDate.format('mm');
        btn_download_accountreport.classList.remove('btn-disabled');
        this.value = pckr.startDate.format('YYYY/MM/DD (ddd) HH:mm') + ' ～ ' + pckr.endDate.format('YYYY/MM/DD (ddd) HH:mm');
    }).on('cancel.daterangepicker', function () {
        acCondition = {};
        btn_download_accountreport.classList.add('btn-disabled');
        this.value = '';
    });
    btn_download_accountreport.onclick = function () {
        if (!acCondition.dateFrom || !acCondition.dateTo || !acCondition.start_hour1 || !acCondition.start_hour2) {
            return false;
        }
        var url = '/reports/getSales/' +
            '?dateFrom=' + acCondition.dateFrom +
            '&dateTo=' + acCondition.dateTo +
            '&owner_username=' + (select_account.value || '') +
            '&start_hour1=' + acCondition.start_hour1 +
            '&start_hour2=' + acCondition.start_hour2 +
            '&reportType=account&dummy=' + Date.now();
        console.log('[donwload] account report', url);
        window.open(url);
    };
});

/**
 * 1時間の高さ
 * @const HOUR_HEIGHT
 */
var HOUR_HEIGHT = 60;

/**
 * スクリーンの幅
 * @const SCREEN_WIDTH
 */
var SCREEN_WIDTH = 160;

/**
 * 作品データ
 */
var films = [];

$(function () {
    films = JSON.parse($('input[name=films]').val());
    // 検索
    $(document).on('click', '.search-button', function (event) {
        event.preventDefault();
        search();
    });
    // 新規作成
    $(document).on('click', '.add-button', function (event) {
        event.preventDefault();
        add();
    });
    // 編集
    $(document).on('click', '.performance', function (event) {
        event.preventDefault();
        var performanceId = $(this).attr('data-performance-id');
        edit(performanceId);
    });

    // 作品検索
    $(document).on('click', '.film-search-button', function (event) {
        event.preventDefault();
        filmSearch();
    });

    // 作品選択
    $(document).on('click', '.film-select-button', function (event) {
        event.preventDefault();
        filmSelect();
    });

    // 新規登録
    $(document).on('click', '.regist-button', function (event) {
        event.preventDefault();
        regist();
    });
});

/**
 * 新規登録（確定）
 * @function register
 * @returns {void}
 */
function regist() {
    var modal = $('#newModal');
    var theater = modal.find('input[name=theater]').val();
    var screen = modal.find('input[name=screen]').val();
    var day = modal.find('input[name=day]').val();
    var film = modal.find('input[name=film]').val();
    var openTime = modal.find('input[name=openTime]').val();
    $.ajax({
        dataType: 'json',
        url: '/master/performance/regist',
        type: 'POST',
        data: {
            theater: theater,
            screen: screen,
            day: day,
            film: film,
            open_time: openTime
        }
    }).done(function (data) {
        if (!data.error) {
            modal.modal('hide');
            return;
        }
        alert('登録に失敗しました');
    }).fail(function (jqxhr, textStatus, error) {
        console.error(jqxhr, textStatus, error);
        alert('登録に失敗しました');
    });
}

/**
 * 検索
 * @function search
 * @returns {void}
 */
function search() {
    var theater = $('select[name=theater]').val();
    var day = $('select[name=day]').val();
    if (!theater || !day) {
        alert('劇場、上映日を選択してください');
        return;
    }
    $.ajax({
        dataType: 'json',
        url: '/master/performance/search',
        type: 'POST',
        data: {
            theater: theater,
            day: day
        }
    }).done(function (data) {
        if (data) {
            create(data.screens, data.performances);
            modalInit(theater, day, data.screens);
        }
    }).fail(function (jqxhr, textStatus, error) {
        console.error(jqxhr, textStatus, error);
    });
}

/**
 * モーダル初期化
 */
function modalInit(theater, day, screens) {
    var screenDom = [];
    screenDom.push('<option value="">選択してください</option>');
    for (var i = 0; i < screens.length; i++) {
        var screen = screens[i];
        screenDom.push('<option value="'+ screen._id +'">'+ screen.name.ja +'</option>')
    }
    
    var newModal = $('#newModal');
    newModal.find('.theater span').text($('select[name=theater] option[value='+ theater +']').text());
    newModal.find('.day span').text(moment(day).format('YYYY年MM月DD日(ddd)'));
    newModal.find('input[name=theater]').val(theater);
    newModal.find('input[name=day]').val(day);
    newModal.find('select[name=screen]').append(screenDom);

    var editModal = $('#editModal');
    editModal.find('.theater span').text($('select[name=theater] option[value='+ theater +']').text());
    editModal.find('.day span').text(moment(day).format('YYYY年MM月DD日(ddd)'));
    editModal.find('select[name=screen]').append(screenDom);
}

/**
 * 作品検索
 * @function filmSearch
 * @returns {void}
 */
function filmSearch() {
    var modal = $('#newModal');
    var filmId = modal.find('input[name=filmId]').val();
    var filmNme = modal.find('input[name=filmNme]').val();
    var result;
    if (filmId !== '') {
        result = films.find(function (film) {
            return (filmId === film._id);
        });
    }
    if (result === undefined) {
        alert('作品がありません');
        return;
    }
    modal.find('.film-name').text(result.name.ja);
    modal.find('.film-name').attr('data-film-id', result._id);
}

/**
 * 作品選択
 * @function filmSelect
 * @returns {void}
 */
function filmSelect() {
    var modal = $('#newModal');
    var filmId = modal.find('.film-name').attr('data-film-id');
    if (filmId === '') {
        alert('作品がありません');
        return;
    }
    modal.find('input[name=filmId]').val(filmId);
}

/**
 * 新規作成
 * @function add
 * @returns {void}
 */
function add() {
    var theater = $('select[name=theater]').val();
    var day = $('select[name=day]').val();
    if (!theater || !day) {
        alert('劇場、上映日を選択してください');
        return;
    }
    var modal = $('#newModal');
    modal.find('.film-name').text('未選択');
    modal.find('.film-name').attr('data-film-id', '');
    modal.find('input[name=film]').val('');
    modal.find('select[name=hour]').val('00');
    modal.find('select[name=minutes]').val('00');
    modal.find('select[name=screen]').val('');
    $('#newModal').modal();
}

/**
 * 編集
 * @function edit
 * @returns {void}
 */
function edit(id) {
    var modal = $('#editModal');
    modal.find('input[name=performanceId]').val(id);
    modal.modal();
}

/**
 * 作成
 * @function create
 * @param {*} screens 
 * @param {*} performances
 * @returns {void} 
 */
function create(screens, performances) {
    var scheduler = $('.scheduler');
    scheduler.html('');
    var dom = $('<table></table>');
    dom.append(createHeader(screens));
    dom.append(createBody(screens, performances));
    scheduler.append(dom);
}

/**
 * ヘッダー作成
 * @function createHeader
 * @param {*} screens 
 * @returns {JQuery} 
 */
function createHeader(screens) {
    var dom = $('<thead class="header"></thead>');
    dom.append('<td>時間</td>');
    for (var i = 0; i < screens.length; i++) {
        var screen = screens[i];
        dom.append('<td style="width: ' + SCREEN_WIDTH + 'px;">' + screen.name.ja + '</td>');
    }
    return dom;
}

/**
 * 中身作成
 * @function createBody
 * @param {*} screens 
 * @param {*} performances 
 * @returns {JQuery} 
 */
function createBody(screens, performances) {
    var dom = $('<tbody><tr></tr></tbody>');
    dom.find('tr').append(createTime());
    for (var i = 0; i < screens.length; i++) {
        var screen = screens[i];
        var target = performances.filter(function (performance) {
            return (performance.screen === screen._id);
        });
        dom.find('tr').append(createScreen(target));
    }
    return dom;
}

/**
 * 時間作成
 * @function createTime
 * @returns {JQuery} 
 */
function createTime() {
    var dom = $('<td class="times"></td>');
    for (var i = 0; i < 24; i++) {
        var time = ('00' + String(i)).slice(-2) + ':00';
        dom.append('<div class="time" style="height: ' + HOUR_HEIGHT + 'px">' + time + '</div>');
    }
    return dom;
}

/**
 * スクリーン作成
 * @function createScreen 
 * @param {*} performances 
 * @returns {JQuery} 
 */
function createScreen(performances) {
    var dom = $('<td class="screen"></td>');
    for (var i = 0; i < performances.length; i++) {
        var performance = performances[i];
        var startTime = performance.open_time;
        var start = {
            hour: Number(startTime.slice(0, 2)),
            minutes: Number(startTime.slice(2, 4))
        };
        var endTime = performance.end_time;
        var end = {
            hour: Number(endTime.slice(0, 2)),
            minutes: Number(endTime.slice(2, 4))
        };
        var hour = 60;
        var top = (start.hour * HOUR_HEIGHT) + (start.minutes * HOUR_HEIGHT / hour);
        var left = 0;
        // 上映時間から判断するべき
        var height = ((end.hour - start.hour) * HOUR_HEIGHT) + ((end.minutes - start.minutes) * HOUR_HEIGHT / hour);
        var width = 100;
        var style = {
            top: top + 'px',
            left: left + 'px',
            height: height + 'px',
            width: width + '%'
        };
        var film = films.find(function (film) {
            return (film.id === performance.film);
        });
        if (!film) continue;
        var performanceDom = $('<div class="performance">' +
            '<div data-performance-id="'+ performance._id +'" role="button" class="inner">' + film.name.ja + '</div>' +
            '</div>');
        performanceDom.css(style);
        dom.append(performanceDom);
    }
    return dom;
}
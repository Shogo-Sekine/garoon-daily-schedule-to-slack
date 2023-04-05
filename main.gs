function getGaroonSecrets() {
  // spreadsheetの情報取得
  const sheet = SpreadsheetApp.getActive().getSheetByName('sheet1');
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues();
}

function generateGaroonToken () {
  // Garoon認証情報からトークンを生成
  const secrets = getGaroonSecrets();
  return Utilities.base64Encode(secrets[0][0] + ':' + secrets[0][1]);
}

function garoonAPI(paramsString) {
  // カレンダーからスケジュール一覧を取得
  // GET時点で日時範囲を絞り込むことはできるのか？
  const subdomain = 'xxxxx'
  const url = 'https://' + subdomain + '.cybozu.com/g/api/v1/schedule/events?' + paramsString;
  const token = generateGaroonToken();
  const requestOptions = {
    method: 'get',
    headers: {
      'X-Cybozu-Authorization': token
    }
  };
  return UrlFetchApp.fetch(url, requestOptions);
}

function garoonDateFormatter (date) {
  return Utilities.formatDate(date, 'JST', "yyyy-MM-dd'T'HH:mm:ssXXX");
}

function dateParser (dateString) {
  return new Date(Date.parse(dateString));
}

function getGaroonSchedules() {
  const nowString = garoonDateFormatter(new Date());
  const paramsArray = [
    'bdate=' + encodeURIComponent(nowString),
    'orderBy=' + encodeURIComponent('start asc')
  ];
  const paramsString = paramsArray.join('＆');
  const response = garoonAPI(paramsString);
  return JSON.parse(response);
}

function notificateOnSlack(messageOption) {
  // slackにメッセージ通知
  const slack_webhook_url = 'https://hooks.slack.com/services/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(messageOption),
  };
  UrlFetchApp.fetch(slack_webhook_url, options);
}

function messageAllDay(event) {
  return '終日予定として「' + event.subject + '」' + 'が入っていますよぉ';
}

function messageWithStartTime(event) {    
  const startDate = dateParser(event.start.dateTime);
  const startDateString = Utilities.formatDate(startDate, 'JST', "HH:mm");
  return startDateString + 'から「' + event.subject + '」' + 'が始まりますよぉ';
}

function messageWithNoEvent() {
  return '今日は予定がなーんにも入っていませんよぉ';
}

function messageWithDate(year, month, date) {
  return 'おはよぉーございます\n ' + year.toString() + '年' + (month + 1).toString() + '月' + date.toString() + '日の予定をお伝えしますよぉ';
}

function execute() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const date = currentDate.getDate();
  notificateOnSlack(
    {
      text: messageWithDate(year, month, date),
    }
  );

  const withinTimeEvent = function (event) {
    const todayStart = new Date(year, month, date, 0);
    const todayEnd = new Date(year, month, date, 23, 59, 59);
    const eventStartDate = dateParser(event.start.dateTime);
    return todayStart <= eventStartDate && eventStartDate <= todayEnd;
  };
  // Garoon予定取得
  const garoonSchedules = getGaroonSchedules();
  const events = garoonSchedules.events.filter(withinTimeEvent);

  // 予定が無い場合
  if (!events.length) {
    notificateOnSlack(
      {
        text: messageWithNoEvent(),
      }
    );
    return;
  }

  // 予定が1件以上ある場合
  events.forEach(function (event) {
    // 終日予定かそうじゃないかで文言を変える
    const message = event.isAllDay? messageAllDay(event) : messageWithStartTime(event);

    notificateOnSlack(
      {
        text: message,
      }
    );
  });
}

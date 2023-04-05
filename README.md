# garoon-schedule-to-slack
Daily notification from today's schedule on garoon to slack  
1日1回、Garoonに登録されている本日のスケジュールを取得してslackに通知させる。

## 実装方法
以下記事を参照。slack連携アプリの作成方法などは他記事

1. slack連携アプリを作成
    
    1. slackのワークスペース名をクリックし、プルダウンを以下のように辿る。
        ![スクリーンショット 2023-04-05 094535](https://user-images.githubusercontent.com/16629235/229953313-499fd335-4942-45f9-a502-909d59ec16de.png)
    
    1. Incoming Webhookを検索し、slackに追加。
        ![スクリーンショット 2023-04-05 094855](https://user-images.githubusercontent.com/16629235/229953679-4a239e88-316e-4123-96ef-a77920a46f85.png)
    
    1. 宛先のチャンネルなどを一通り設定。その際に発行されるwebhook urlはgasコード内で使用するので控えておくこと。

1. スプレッドシートを作成し、Garoon認証情報を記載する。キー名は画像のようにする。
    (スプレッドシートは必ず非公開にすること。運用は自己責任で。)
    ![スクリーンショット 2023-04-04 102143](https://user-images.githubusercontent.com/16629235/229953960-0f2c1500-70c7-4c6a-a5bc-ff3583ea1d92.png)

1. スプレッドシートのページ内からApp script作成画面を開き、main.gsの中身を写す。  
    サブドメインなどは自身の環境に合わせて適宜変更すること。
1. トリガーを登録する。(任意の時刻で良い)


## 補足
まずスプレッドシートを作成の上、同一ウィンドウ内のメニューからGASを作成すること。  
現在の使用ではスプレッドシート上にGaroon認証情報を書く必要があるので、使用は自己責任でお願いします。

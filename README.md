# DeepSpeechElectron

ダウンロードは
[コチラ](https://github.com/mujurin1/DeepSpeechElectron/releases)
から一番上の「Setup.exe」を選択してください


このアプリは
[ゆかりねっと](https://nmori.github.io/yncneo-Docs)
へ喋った文字を送信するための Windows 専用アプリです

このアプリを作った目的はゆかりねっと使用者を支援するためです  
ゆかりねっとを使う場合、普通は次のページを利用すると思います  
https://storage.googleapis.com/website-datas/spe-recog-ync/index.html  
このページではブラウザ標準の音声認識を利用するため、日時や時間帯によってはうまく動かないときがあります  
その時に **代用** として使うためのアプリを目指して制作しました

普段は上記のページを利用して、うまく動かない時だけ代用としてこのアプリを使われる事を目的としています  

このアプリでは Deepgram (https://deepgram.com) という音声認識サービスを利用します  
Deepgram については [このページの下](#Deepgram) で説明します

このアプリの特徴
* 有料の Deepgram サービスを利用します  
  （アカウントの作成は簡単で、最初は200ドル分無料で使い始められます）  
  （クレジットカードの登録も不要です）
* 喋り終わるまでは文字起こしされません  
  ※Deepgram にはリアルタイムAPIがありますが DeepSpeechElectron では現在対応していません
* デスクトップアプリなのでインストールが必要です


## 使い方
1. DeepSpeechElectron を起動します
2. Deepgram のアカウントを作成します  
   サインアップ: https://console.deepgram.com/signup  
   （Google アカウントがあればすぐに作成出来ます）  
   （クレジットカードの登録も不要です）
4. [ダッシュボード](https://console.deepgram.com)
   から「Create a New API Key」ボタンを押してAPI Keyを作成します
   1. 「Name your Key」は適当に名前を入力します
   2. 「Set permissions」は「Member」を選択します
   3. 「Set Expiration」は生成するキーの有効期限を設定します  
      * Never - 無期限
      * Duration - キーが無効化になるまでの時間を決める
      * Date - キーが無効になる日を決める
5. 「Create Key」を押して表示されたキーをコピーします
6. この画面を閉じると二度とキーにアクセスできない旨の表示を了承して画面を閉じます
7. DeepSpeechElectron に戻りAPI Keyにコピーしたキーを貼り付けて、「設定を更新する」ボタンを押します
8. 「全て接続する」ボタンを押して設定は終了です  
   次回からはAPI Keyは保存されているので「全て接続する」ボタンを押すだけです


## Deepgram
Deepgram は音声認識やテキスト読み上げをするサービスです  
認識の正確さと応答の速さはChromeの音声認識と同程度です

このサービスは有料ですがアカウントを作成すると200ドルの無料クレジットを貰えます  
このクレジットは有効期限はありません

Deepgram の課金の仕組みは先払い式です  
予めクレジットを追加しておき、クレジットが無くなるまで使えます

使用料金は文字起こしする音声の長さによって掛かります  
DeepSpeechElectron では実際に喋っている部分のみを切り取って送るため、  
1時間起動していても掛かる料金は1時間分よりも少ないはずです

Deepgram の料金: https://deepgram.com/pricing  
※Nova2モデルを使用する場合（1ドル＝156.82円 で計算）  
1分間で0.0043ドル（0.67円）  
1時間で0.258ドル（40.46円）  


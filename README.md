# AquaLife Manager (水槽・生態管理システム)

飼育している生態と水槽/ケージの情報を一元管理するWebアプリケーション。
給餌日カレンダー、水槽サイズ・水量に基づく清掃日の自動スケジューリング、
ルールベースの健康管理機能(外部AI APIは不使用)を提供する。

## 主な機能

- **水槽/ケージ管理**: サイズ・水量・レイアウト情報に加え、気温・湿度・水温・ライト種別・
  ヒーター/ファンの使用時間帯、形状(キューブ水槽・ハイ水槽・爬虫類ケージ・虫籠など)を登録できる
- **生態管理**: 種・個体・導入日・体調記録の履歴を管理する
- **水槽の環境記録**: 気温・湿度・水温・綺麗度を都度記録して履歴として保存し、カレンダーの
  日別詳細にも反映する
- **詳細ダッシュボード**: 水槽/生態それぞれの詳細ページで、環境状態・健康状態を
  顔イラスト(良好/要観察/要注意)と数値でひと目で確認できる。一覧・詳細ページには
  水槽の形状や生態の分類に応じたイラストも表示される
- **一覧と追加/編集ページの分離**: 一覧ページは登録内容の確認に専念し、追加・編集は
  専用ページで行う。削除時は確認ダイアログを表示する
- **カレンダー**: 給餌日・清掃日の予定確認、実施記録の登録・取消、予定日以外の実施(早め・遅め)にも対応する
- **自動スケジューリング**: 水槽サイズ・水量・収容生体数から清掃日を自動算出する。
  給餌/清掃の頻度(回数・単位・曜日)を手動で設定することもできる
- **健康管理**: 体調記録・特記事項・飼育密度・給餌/清掃の実施状況から、ルールベースで
  健康状態の目安を分析する(外部AI APIは不使用)
- **ホーム画面の天気ウィジェット**: 選択した都道府県の気温・湿度・天気をイラスト付きで表示する
- **並び替え・絞り込み**: 五十音順/オリジナル順の切り替え、種類別の絞り込み、
  ドラッグ&ドロップでの並び替えに対応する
- **Supabase Authによるログイン認証**: 未ログインではアプリ本体・DBに一切アクセスできない

## ドキュメント

- [制作フロー](docs/flow.md) — 開発の全体ステップと進捗
- [要件定義](docs/requirements.md) — 機能要件・技術スタック・データベース方針

## 技術スタック

- Next.js (App Router) + TypeScript + Tailwind CSS
- データベース: Supabase (PostgreSQL)

## セットアップ

1. [Supabase](https://supabase.com/)でプロジェクトを作成する
2. SupabaseのSQL Editorで [supabase/schema.sql](supabase/schema.sql) の内容を実行し、テーブルを作成する
3. Supabaseの Settings > API から Project URL と anon public key を取得し、`.env.local.example` を `.env.local` にコピーして値を設定する
4. Supabaseダッシュボードの **Authentication > Users** から、自分用のログインアカウント(メールアドレス+パスワード)を作成する。「Add user」→「Create new user」→「Auto Confirm User」をONにして作成する(アプリ内に公開のサインアップ画面は無い)

```bash
cp .env.local.example .env.local
# .env.local を編集して NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY を設定
npm install
npm run dev
```

`http://localhost:3000` で起動します。PWA対応(manifest / Service Worker)済み。

### 認証について

このアプリはSupabase Authによるログインで保護されている。未ログインの場合はログインフォームのみが表示され、
水槽・生態データの閲覧/操作は一切できない(DB側もRLSで`auth.uid() is not null`を要求しており、
未認証でのAPIアクセスも拒否される)。ユーザー登録はSupabaseダッシュボードから行う運用とし、
アプリ内に公開のサインアップ画面は設けていない(誰でも自由にアカウントを作れないようにするため)。

### ローカルでのワンクリック起動

macOSでは [start-aqualife-manager.command](start-aqualife-manager.command) をダブルクリックすると、
初回はビルドを行い、以降はサーバーを起動してブラウザで自動的に開く。終了するにはターミナルウィンドウを閉じる。

### 公開URLへのデプロイ(他端末からのアクセス)

[Vercel](https://vercel.com/)へのデプロイを想定している。

1. このリポジトリをGitHubにpushする(`git push`)
2. Vercelでアカウントを作成し、このGitHubリポジトリをImportする
3. Vercelのプロジェクト設定 > Environment Variables に `NEXT_PUBLIC_SUPABASE_URL` と
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定する(`.env.local`と同じ値)
4. デプロイ後に発行されるURLへアクセスすると、ログイン画面が表示される。
   ログインアカウントを知らない第三者はアプリの中身を一切閲覧できない

## GitHubリポジトリへの接続方法

このプロジェクトはローカルgitで初期化済み。GitHub上に新規リポジトリを作成し、以下の手順でリモート接続する。

```bash
# 1. GitHub上で新規リポジトリを作成(例: aqualife-manager)し、URLを控える
# 2. リモートを追加
git remote add origin https://github.com/<your-username>/aqualife-manager.git

# 3. プッシュ
git branch -M main
git push -u origin main
```

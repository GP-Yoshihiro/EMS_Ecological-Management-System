# AquaLife Manager (水槽・生態管理システム)

飼育している生態と水槽/ケージの情報を一元管理するWebアプリケーション。
給餌日カレンダー、水槽サイズ・水量に基づく清掃日の自動スケジューリング、AIによる健康管理機能を提供する。

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

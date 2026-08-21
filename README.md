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

```bash
cp .env.local.example .env.local
# .env.local を編集して NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY を設定
npm install
npm run dev
```

`http://localhost:3000` で起動します。PWA対応(manifest / Service Worker)済み。

現状のRLSポリシーは個人利用・未認証(anon key)を前提とした暫定設定です。公開URLへデプロイする場合は
Supabase Authによる認証を追加し、`auth.uid()`に基づくポリシーへ差し替えてください。

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

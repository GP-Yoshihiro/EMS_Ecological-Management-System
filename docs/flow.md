# 制作フロー

水槽・生態管理システム開発の全体フロー。各ステップ完了後にチェックを入れる。

- [x] 1. フォルダの用意
- [x] 2. バージョン管理システムとの同期(ローカルgit初期化。リモートはユーザー側でGitHubリポジトリを作成し接続)
- [x] 3. VSCodeフォルダの追加
- [x] 4. CLAUDE.mdの追加
- [x] 5. 基盤システムの作成(Next.js + TypeScript + Tailwind CSSの雛形構築、PWA対応)
- [x] 6. カレンダーの作成(給餌日・清掃日を表示するアプリ内カレンダーUI。外部カレンダー連携は不要のため対象外)
- [ ] 7. ユーザーが追加する情報(レイアウト情報、生態情報)の定義・保存
- [ ] 8. データベースとの接続・同期・更新
- [ ] 9. 現段階でアプリケーションとしての起動、テスト確認
- [ ] 10. 自動スケジューリングシステムの追加実装(水槽/ケージのサイズ・水量から清掃日を自動算出)
- [ ] 11. 生態、水槽内の情報から健康管理AIを搭載実装
- [ ] 12. アプリケーションの起動、テスト
- [ ] 13. マスターアップ

## 決定事項(2026-08-21時点)

- プラットフォーム: Webアプリ(PWA)
- バージョン管理: 新規GitHubリポジトリを作成する方針。ただし本セッションの環境からは認証済みのGitHub連携手段がないため、ローカルgitで管理し、リモート接続はユーザー側で実施する(手順は README.md 参照)。
- データベース: 未定。要件(複数水槽・複数生態の管理、カレンダー同期、将来のAI健康管理機能)から、リレーショナルなクラウドDB(Supabase/PostgreSQL)を提案。詳細はdocs/requirements.mdの「データベース方針」を参照。

## 決定事項(2026-08-21 ヒアリング、ステップ5着手前)

- 外部カレンダー連携: 不要(アプリ内カレンダーのみ)
- 対象生態: 魚・爬虫類・昆虫など幅広く対応
- マルチユーザー対応: 不要(個人利用のみ)

詳細はdocs/requirements.mdの「決定事項」を参照。

## ステップ5 完了メモ(2026-08-21)

- `create-next-app`(App Router / TypeScript / Tailwind CSS / ESLint / src ディレクトリ)で雛形を構築
- PWA対応として `public/manifest.json`・`public/sw.js`(Service Worker)・`public/icons/icon.svg` を追加し、`src/app/layout.tsx` にmanifest/theme-colorを設定、`src/components/ServiceWorkerRegister.tsx` で登録
- トップページ(`src/app/page.tsx`)を主要機能5項目を紹介する内容に置き換え
- `npm run build`(Lint + 型チェック + ビルド)、ローカルdevサーバーでの表示確認、manifest/Service Worker登録の動作確認まで完了
- ブランチ: `feature/step5-foundation`(ユーザー承認のうえmainにローカルマージ済み)

## ステップ6 完了メモ(2026-08-21)

- 月表示のアプリ内カレンダー(`/calendar`)を実装。前月・次月移動、日付選択で給餌・清掃の予定一覧を表示
- 型定義 `src/types/schedule.ts`、月グリッド生成 `src/lib/calendar.ts`、サンプルデータ生成 `src/lib/mock-schedule.ts` を追加
- 生態・水槽データの登録・保存機能(ステップ7)およびDB接続(ステップ8)が未実装のため、現段階はモックデータで表示。実データ実装後に `mock-schedule.ts` を実データ取得に置き換える
- 外部カレンダー連携は決定事項により対象外
- `npm run build`(Lint + 型チェック + ビルド)、devサーバーでの表示・月送り・日付選択の動作確認済み
- ブランチ: `feature/step6-calendar`(未マージ、PRはユーザー承認後にマージ予定)

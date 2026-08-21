#!/bin/bash
# AquaLife Manager をワンクリックで起動してブラウザで開く(ダブルクリック起動用)
set -e
cd "$(dirname "$0")"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

PORT=3000
URL="http://localhost:$PORT"

if [ ! -f ".env.local" ]; then
  echo "エラー: .env.local が見つかりません。README.md のセットアップ手順を確認してください。"
  read -p "Enterキーで終了します..." _
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "初回起動のため依存関係をインストールしています..."
  npm install
fi

if [ ! -d ".next" ]; then
  echo "初回起動のためビルドしています(数分かかることがあります)..."
  npm run build
fi

echo "AquaLife Manager を起動しています..."
npm run start -- -p "$PORT" &
SERVER_PID=$!

# サーバーの起動を待ってからブラウザを開く
for _ in $(seq 1 30); do
  if curl -s -o /dev/null "$URL"; then
    break
  fi
  sleep 1
done

open "$URL"

echo ""
echo "AquaLife Manager が起動しました: $URL"
echo "終了するには、このウィンドウを閉じるか Ctrl+C を押してください。"
wait $SERVER_PID

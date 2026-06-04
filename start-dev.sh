#!/bin/bash
# ローカル開発用の起動スクリプト
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== バックエンド起動 (port 8000) ==="
cd "$ROOT_DIR/backend"
.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

echo "=== フロントエンド起動 (port 3000) ==="
cd "$ROOT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "起動完了:"
echo "  フロントエンド: http://localhost:3000"
echo "  バックエンドAPI: http://localhost:8000"
echo "  API docs: http://localhost:8000/docs"
echo ""
echo "終了するには Ctrl+C を押してください"

# Ctrl+C で両プロセスを終了
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait

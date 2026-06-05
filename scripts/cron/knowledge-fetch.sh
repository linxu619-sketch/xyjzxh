#!/usr/bin/env bash
# ============================================================
# 信阳建装 · 每日知识库抓取（Linux / macOS）
# ------------------------------------------------------------
# 由 crontab 或 systemd timer 定时调用，触发 AI 抓取 → 草稿箱待审。
# 需要环境变量：
#   CRON_SECRET  必填，与服务端 .env.local 里的 CRON_SECRET 一致
#   SITE_URL     可选，默认 http://127.0.0.1:3000（本机直连，免走公网/HTTPS）
#   LOG_DIR      可选，默认 ./logs
# 用法：
#   CRON_SECRET=xxx ./knowledge-fetch.sh
# ============================================================
set -euo pipefail

BASE_URL="${SITE_URL:-http://127.0.0.1:3000}"
SECRET="${CRON_SECRET:?请先设置 CRON_SECRET 环境变量（与服务端一致）}"
LOG_DIR="${LOG_DIR:-$(cd "$(dirname "$0")" && pwd)/logs}"
mkdir -p "$LOG_DIR"

STAMP="$(date '+%Y-%m-%d %H:%M:%S')"
OUT="$LOG_DIR/knowledge-cron.last.json"

HTTP_CODE="$(curl -sS --max-time 150 \
  -o "$OUT" -w '%{http_code}' \
  -H "Authorization: Bearer ${SECRET}" \
  "${BASE_URL}/api/cron/knowledge-fetch" || echo 000)"

BODY="$(cat "$OUT" 2>/dev/null || echo '')"
echo "[$STAMP] HTTP ${HTTP_CODE} ${BODY}" >> "$LOG_DIR/knowledge-cron.log"

# 非 2xx 以非零退出，便于 cron/systemd 标记失败
case "$HTTP_CODE" in
  2*) echo "[$STAMP] OK" ; exit 0 ;;
  *)  echo "[$STAMP] FAILED HTTP ${HTTP_CODE}" >&2 ; exit 1 ;;
esac

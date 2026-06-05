#!/usr/bin/env bash
# ============================================================
# 信阳建装 · 每日知识库抓取（Linux / macOS）
# ------------------------------------------------------------
# 由 crontab 或 systemd timer 定时调用，触发 AI 抓取 → 草稿箱待审。
# 密钥/地址来源（优先级从高到低）：
#   1. 环境变量 CRON_SECRET / SITE_URL
#   2. 项目根 .env.local 里的 CRON_SECRET / SITE_URL（自动读取，单一来源）
# 可选：LOG_DIR（默认脚本同级 logs/）
# 用法：
#   ./knowledge-fetch.sh                 # 自动读 .env.local
#   CRON_SECRET=xxx ./knowledge-fetch.sh # 显式覆盖
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="${ENV_FILE:-$SCRIPT_DIR/../../.env.local}"   # 项目根 .env.local

# 未显式给环境变量时，从 .env.local 读取（容忍引号/空格）
read_env() { grep -E "^$1=" "$ENV_FILE" 2>/dev/null | tail -n1 | cut -d= -f2- | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e 's/^"\(.*\)"$/\1/' -e "s/^'\(.*\)'\$/\1/"; }
if [ -f "$ENV_FILE" ]; then
  [ -z "${CRON_SECRET:-}" ] && CRON_SECRET="$(read_env CRON_SECRET)" || true
  [ -z "${SITE_URL:-}" ] && SITE_URL="$(read_env SITE_URL)" || true
fi

BASE_URL="${SITE_URL:-http://127.0.0.1:3000}"
SECRET="${CRON_SECRET:?未找到 CRON_SECRET（环境变量或 .env.local 均无）}"
LOG_DIR="${LOG_DIR:-$SCRIPT_DIR/logs}"
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

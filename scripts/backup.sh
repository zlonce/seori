#!/usr/bin/env bash
# MySQL 일일 백업 스크립트 (서버의 ~/seori 에서 실행)
# - 로컬: ~/backups/seori_YYYYmmdd_HHMMSS.sql.gz, KEEP_DAYS일 지난 파일 삭제
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/seori}"
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups}"
KEEP_DAYS="${KEEP_DAYS:-14}"
RCLONE_REMOTE="${RCLONE_REMOTE:-}"

mkdir -p "$BACKUP_DIR"
cd "$APP_DIR"

FILE="$BACKUP_DIR/seori_$(date +%Y%m%d_%H%M%S).sql.gz"

docker compose exec -T mysql sh -c \
  'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction --routines --triggers --no-tablespaces seori' \
  | gzip > "$FILE.tmp"

mv "$FILE.tmp" "$FILE"
echo "backup ok: $FILE ($(du -h "$FILE" | cut -f1))"

find "$BACKUP_DIR" -name 'seori_*.sql.gz' -mtime +"$KEEP_DAYS" -delete

if [ -n "$RCLONE_REMOTE" ]; then
  rclone copy "$FILE" "$RCLONE_REMOTE"
  echo "uploaded: $RCLONE_REMOTE"
fi

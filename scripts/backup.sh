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

trap 'rm -f "$FILE.tmp"' EXIT

# 비밀번호를 명령줄 인자로 넘기지 않도록 컨테이너 안에서 임시 옵션 파일(0600)을 만들어 전달
docker compose exec -T mysql sh -c \
  'umask 077; cnf=$(mktemp); trap "rm -f $cnf" EXIT; printf "[client]\nuser=root\npassword=\"%s\"\n" "$MYSQL_ROOT_PASSWORD" > "$cnf"; mysqldump --defaults-extra-file="$cnf" --single-transaction --routines --triggers --no-tablespaces seori' \
  | gzip > "$FILE.tmp"

mv "$FILE.tmp" "$FILE"
echo "backup ok: $FILE ($(du -h "$FILE" | cut -f1))"

find "$BACKUP_DIR" -name 'seori_*.sql.gz' -mtime +"$KEEP_DAYS" -delete

if [ -n "$RCLONE_REMOTE" ]; then
  rclone copy "$FILE" "$RCLONE_REMOTE"
  echo "uploaded: $RCLONE_REMOTE"
fi

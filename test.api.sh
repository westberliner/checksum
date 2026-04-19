#!/usr/bin/env bash
set -euo pipefail

NEXTCLOUD="http://nextcloud.devl:8080"
USER="root"
PASS="root"
REMOTE_PATH="/Nextcloud.png"   # must exist in the user's home folder

BASE_URL="$NEXTCLOUD/ocs/v2.php/apps/checksum/api/v1/checksum"
PASS_COUNT=0
FAIL_COUNT=0

pass() { echo "  PASS  $1"; PASS_COUNT=$((PASS_COUNT + 1)); }
fail() { echo "  FAIL  $1 — $2"; FAIL_COUNT=$((FAIL_COUNT + 1)); }

ocs_get() {
  curl -s -u "$USER:$PASS" "$BASE_URL?$1&format=json"
}

checksum_value() {
  python3 -c "import sys,json; print(json.load(sys.stdin)['ocs']['data']['checksum'])" 2>/dev/null
}

error_value() {
  python3 -c "import sys,json; print(json.load(sys.stdin)['ocs']['data']['error'])" 2>/dev/null
}

http_status() {
  python3 -c "import sys,json; print(json.load(sys.stdin)['ocs']['meta']['statuscode'])" 2>/dev/null
}

echo "=== Checksum API tests ==="
echo "  Target: $NEXTCLOUD"
echo "  File:   $REMOTE_PATH"
echo ""

# Download file once for local verification
TMP=$(mktemp)
trap 'rm -f "$TMP"' EXIT
HTTP=$(curl -s -o "$TMP" -w "%{http_code}" -u "$USER:$PASS" \
  "$NEXTCLOUD/remote.php/dav/files/$USER$REMOTE_PATH")
if [ "$HTTP" != "200" ]; then
  echo "ERROR: could not download $REMOTE_PATH (HTTP $HTTP) — aborting"
  exit 1
fi
echo "  Downloaded $REMOTE_PATH for local verification"
echo ""

echo "--- Algorithm tests ---"
for ALGO in md5 sha1 sha256 sha384 sha512 sha3-256 sha3-512 crc32b; do
  RESP=$(ocs_get "path=$REMOTE_PATH&algorithm=$ALGO")
  STATUS=$(echo "$RESP" | http_status)
  if [ "$STATUS" != "200" ]; then
    fail "$ALGO" "HTTP $STATUS"
    continue
  fi

  REMOTE=$(echo "$RESP" | checksum_value)
  case "$ALGO" in
    md5)     LOCAL=$(md5 -q "$TMP" 2>/dev/null || md5sum "$TMP" | awk '{print $1}') ;;
    sha1)    LOCAL=$(shasum -a 1   "$TMP" | awk '{print $1}') ;;
    sha256)  LOCAL=$(shasum -a 256 "$TMP" | awk '{print $1}') ;;
    sha384)  LOCAL=$(shasum -a 384 "$TMP" | awk '{print $1}') ;;
    sha512)  LOCAL=$(shasum -a 512 "$TMP" | awk '{print $1}') ;;
    sha3-256|sha3-512|crc32b)
             # No standard CLI tool — just check non-empty response
             if [ -n "$REMOTE" ]; then pass "$ALGO (non-empty)"; else fail "$ALGO" "empty hash"; fi
             continue ;;
  esac

  if [ "$LOCAL" = "$REMOTE" ]; then
    pass "$ALGO ($REMOTE)"
  else
    fail "$ALGO" "local=$LOCAL remote=$REMOTE"
  fi
done

echo ""
echo "--- Byte range test ---"
FILE_SIZE=$(wc -c < "$TMP")
END=$((FILE_SIZE < 1024 ? FILE_SIZE : 1024))
RESP=$(ocs_get "path=$REMOTE_PATH&algorithm=sha256&byteStart=0&byteEnd=$END")
STATUS=$(echo "$RESP" | http_status)
REMOTE=$(echo "$RESP" | checksum_value)
LOCAL=$(dd if="$TMP" bs=1 count="$END" 2>/dev/null | shasum -a 256 | awk '{print $1}')
if [ "$STATUS" = "200" ] && [ "$LOCAL" = "$REMOTE" ]; then
  pass "byte range 0-$END sha256 ($REMOTE)"
else
  fail "byte range 0-$END" "status=$STATUS local=$LOCAL remote=$REMOTE"
fi

echo ""
echo "--- Error handling ---"

RESP=$(ocs_get "path=$REMOTE_PATH&algorithm=invalid")
STATUS=$(echo "$RESP" | http_status)
[ "$STATUS" = "400" ] && pass "invalid algorithm → 400" || fail "invalid algorithm" "expected 400, got $STATUS"

RESP=$(ocs_get "path=/nonexistent.txt&algorithm=sha256")
STATUS=$(echo "$RESP" | http_status)
[ "$STATUS" = "404" ] && pass "missing file → 404" || fail "missing file" "expected 404, got $STATUS"

RESP=$(ocs_get "path=$REMOTE_PATH&algorithm=sha256&byteStart=-1")
STATUS=$(echo "$RESP" | http_status)
[ "$STATUS" = "400" ] && pass "negative byteStart → 400" || fail "negative byteStart" "expected 400, got $STATUS"

RESP=$(ocs_get "path=$REMOTE_PATH&algorithm=sha256&byteStart=100&byteEnd=50")
STATUS=$(echo "$RESP" | http_status)
[ "$STATUS" = "400" ] && pass "byteStart >= byteEnd → 400" || fail "byteStart >= byteEnd" "expected 400, got $STATUS"

echo ""
echo "=== Results: $PASS_COUNT passed, $FAIL_COUNT failed ==="
[ "$FAIL_COUNT" -eq 0 ] || exit 1

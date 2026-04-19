# Checksum API

## Authentication

All endpoints require a valid Nextcloud session, Basic Auth, or an app token. No admin privileges are needed.

---

## OCS endpoint

```
GET /ocs/v2.php/apps/checksum/api/v1/checksum
```

### Parameters

| Parameter   | Required | Description |
|-------------|----------|-------------|
| `path`      | yes      | File path relative to the user's home folder (e.g. `/Documents/file.csv`) |
| `algorithm` | yes      | Hash algorithm — `md5`, `sha1`, `sha256`, `sha384`, `sha512`, `sha3-256`, `sha3-512`, `crc32`, `crc32b` |
| `byteStart` | no       | Start byte offset for partial hashing (inclusive, 0-based) |
| `byteEnd`   | no       | End byte offset for partial hashing (exclusive) |
| `format`    | no       | `json` or `xml` (default: `xml`) |

### Responses

**200 OK**
```json
{
  "ocs": {
    "meta": { "status": "ok", "statuscode": 200, "message": "OK" },
    "data": {
      "checksum": "0d8e12cdcd94ccd3328665ee216fab2cc183d2fba609a64e93d77e4e07b364ab",
      "algorithm": "sha256",
      "path": "/Documents/file.csv"
    }
  }
}
```

**400 Bad Request** — invalid algorithm, negative byte offset, or `byteStart >= byteEnd`
```json
{
  "ocs": {
    "meta": { "status": "failure", "statuscode": 400, "message": "Bad Request" },
    "data": { "error": "The algorithm type \"invalid\" is not a valid or supported algorithm type." }
  }
}
```

**404 Not Found** — file does not exist or is not accessible
```json
{
  "ocs": {
    "meta": { "status": "failure", "statuscode": 404, "message": "Not Found" },
    "data": { "error": "File not found." }
  }
}
```
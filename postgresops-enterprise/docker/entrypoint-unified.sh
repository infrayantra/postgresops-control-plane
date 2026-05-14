#!/bin/sh
set -e
cd /app/backend
alembic upgrade head
exec /usr/bin/supervisord -n -c /etc/supervisor/supervisord.conf

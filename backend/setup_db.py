import os

import pymysql


# These defaults target MySQL through the host port published by docker-compose.yml.
conn = pymysql.connect(
    host=os.getenv("DB_HOST", "localhost"),
    user=os.getenv("DB_ROOT_USER", "root"),
    password=os.getenv("DB_ROOT_PASSWORD", "root"),
    port=int(os.getenv("DB_PORT", "3306")),
)

with conn.cursor() as cur:
    cur.execute(
        "CREATE DATABASE IF NOT EXISTS eventify "
        "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
    )
    cur.execute(
        "CREATE USER IF NOT EXISTS 'eventify'@'%' IDENTIFIED BY 'eventify_password'"
    )
    cur.execute("GRANT ALL ON eventify.* TO 'eventify'@'%'")

conn.commit()
conn.close()
print("db ready")

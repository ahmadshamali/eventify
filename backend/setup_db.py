import pymysql

conn = pymysql.connect(host='localhost', user='root', password='', port=3306)
cur = conn.cursor()
cur.execute('CREATE DATABASE IF NOT EXISTS eventify CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci')
cur.execute("CREATE USER IF NOT EXISTS 'eventify'@'localhost' IDENTIFIED BY 'eventify_password'")
cur.execute("GRANT ALL ON eventify.* TO 'eventify'@'localhost'")
conn.commit()
conn.close()
print('db ready')

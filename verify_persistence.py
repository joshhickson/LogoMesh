import sqlite3
import json
import os

print('--- Checking JSON ---')
json_path = 'data/dboms/dbom_test_fibonacci_04.json'
if os.path.exists(json_path):
    with open(json_path, 'r') as f:
        data = json.load(f)
        print(f'JSON loaded successfully. Battle ID: {data.get("battle_id")}')
else:
    print('JSON file not found!')

print('\n--- Checking SQLite ---')
db_path = 'data/battles.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute('SELECT battle_id, timestamp, score_rationale FROM battles ORDER BY timestamp DESC LIMIT 1')
    row = cursor.fetchone()
    print(f'Latest DB Row: {row}')
    conn.close()
else:
    print('Database file not found!')


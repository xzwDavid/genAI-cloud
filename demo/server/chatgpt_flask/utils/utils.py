import mysql.connector
from datetime import datetime
def get_current_time():
    current_time = datetime.now()
    formatted_time = current_time.strftime("%Y-%m-%d %H:%M:%S")
    return formatted_time


class Database:
    def __init__(self, host, username, password, database):
        self.host = host
        self.username = username
        self.password = password
        self.database = database
        self.conn = None

    def connect(self):
        self.conn = mysql.connector.connect(
            host=self.host,
            user=self.username,
            password=self.password,
            database=self.database
        )
        print("Connected to database.")

    def disconnect(self):
        if self.conn:
            self.conn.close()
            print("Disconnected from database.")
        else:
            print("No database connection to disconnect.")

    def create_table(self, table_name, columns):
        if not self.conn:
            print("Not connected to any database.")
            return

        cursor = self.conn.cursor()
        column_definitions = ', '.join(columns)
        query = f"CREATE TABLE IF NOT EXISTS {table_name} ({column_definitions})"
        cursor.execute(query)
        self.conn.commit()
        print(f"Table '{table_name}' created.")

    def insert_data(self, table_name, data):
        if not self.conn:
            print("Not connected to any database.")
            return

        cursor = self.conn.cursor()
        placeholders = ', '.join(['%s'] * len(data))
        query = f"INSERT INTO {table_name} VALUES ({placeholders})"
        cursor.execute(query, data)
        self.conn.commit()
        #print("Data inserted successfully.")

    def select_data(self, table_name, column, content, element):
        if not self.conn:
            print("Not connected to any database.")
            return

        cursor = self.conn.cursor()
        query = f"SELECT {element} FROM {table_name} WHERE {column} = '{content}' LIMIT 1"
        cursor.execute(query)
        data = cursor.fetchone()
        if data:
            return data[0]
        else:
            return None


    def fetch_data(self, table_name):
        if not self.conn:
            print("Not connected to any database.")
            return

        cursor = self.conn.cursor()
        query = f"SELECT * FROM {table_name}"
        cursor.execute(query)
        data = cursor.fetchall()
        return data
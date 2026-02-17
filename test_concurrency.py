import requests
import json
import threading

def test_patch(id, thread_id):
    url = f'http://127.0.0.1:8000/api/oportunidades/{id}/'
    payload = {
        'stage_id': 2,
        'type': 'opportunity'
    }
    headers = {'Content-Type': 'application/json'}
    
    try:
        response = requests.patch(url, data=json.dumps(payload), headers=headers)
        if response.status_code != 200:
            print(f"Thread {thread_id} FAILED: Status {response.status_code}, Response: {response.text}")
        else:
            print(f"Thread {thread_id} SUCCESS")
    except Exception as e:
        print(f"Thread {thread_id} ERROR: {e}")

if __name__ == "__main__":
    threads = []
    for i in range(10):
        t = threading.Thread(target=test_patch, args=(13, i))
        threads.append(t)
        t.start()
    
    for t in threads:
        t.join()

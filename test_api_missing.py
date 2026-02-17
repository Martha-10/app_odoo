import requests
import json

def test_patch_missing():
    url = 'http://127.0.0.1:8000/api/oportunidades/99999/'
    payload = {
        'stage_id': 2,
        'type': 'opportunity'
    }
    headers = {'Content-Type': 'application/json'}
    
    print(f"Testing PATCH to {url}...")
    try:
        response = requests.patch(url, data=json.dumps(payload), headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_patch_missing()

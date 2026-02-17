import requests
import json

def test_patch_lead_to_opportunity():
    url = 'http://127.0.0.1:8000/api/oportunidades/5/'
    payload = {
        'stage_id': 2,
        'type': 'opportunity'
    }
    headers = {'Content-Type': 'application/json'}
    
    print(f"Testing PATCH to {url} (ID 5 is a Lead)...")
    try:
        response = requests.patch(url, data=json.dumps(payload), headers=headers)
        print(f"Status Code: {response.status_code}")
        if response.status_code != 200:
            print(f"Response Body: {json.dumps(response.json(), indent=2)}")
        else:
            print("Success!")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_patch_lead_to_opportunity()

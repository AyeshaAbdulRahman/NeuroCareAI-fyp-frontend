import requests
import json

# Test the login endpoint
url = 'http://127.0.0.1:5000/api/auth/login'
data = {
    'email': 'admin@neurocare.ai',
    'password': 'admin123'
}

print("Testing login endpoint...")
print(f"URL: {url}")
print(f"Data: {data}\n")

try:
    response = requests.post(url, json=data, timeout=5)
    print(f'✓ Status Code: {response.status_code}')
    print(f'✓ Response: {json.dumps(response.json(), indent=2)}')
except ConnectionError:
    print('✗ Connection Error: Backend server is not running on http://127.0.0.1:5000')
except requests.exceptions.Timeout:
    print('✗ Timeout: Backend server is not responding')
except Exception as e:
    print(f'✗ Error: {type(e).__name__}: {e}')

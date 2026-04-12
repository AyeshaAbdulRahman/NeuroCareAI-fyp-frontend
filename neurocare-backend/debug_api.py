import requests
import json

# Test health endpoint first
print("1. Testing health endpoint...")
url = 'http://127.0.0.1:5000/api/health'

try:
    response = requests.get(url, timeout=5)
    print(f'   Status: {response.status_code}')
    print(f'   Response: {json.dumps(response.json(), indent=2)}\n')
except Exception as e:
    print(f'   Error: {e}\n')

# List all registered routes
print("2. Testing login endpoint...")
url = 'http://127.0.0.1:5000/api/auth/login'
data = {
    'email': 'admin@neurocare.ai',
    'password': 'admin123'
}

try:
    response = requests.post(url, json=data, timeout=5)
    print(f'   Status: {response.status_code}')
    print(f'   Response: {json.dumps(response.json(), indent=2)}\n')
except Exception as e:
    print(f'   Error: {e}\n')

print("3. Testing OPTIONS request (for CORS)...")
try:
    response = requests.options(url, timeout=5)
    print(f'   Status: {response.status_code}')
    print(f'   Headers: {dict(response.headers)}\n')
except Exception as e:
    print(f'   Error: {e}\n')

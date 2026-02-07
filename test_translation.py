import requests
import json

def test_translate(text, target_lang):
    url = "https://translate.googleapis.com/translate_a/single"
    params = {
        'client': 'gtx',
        'sl': 'auto',
        'tl': target_lang,
        'dt': 't',
        'q': text
    }
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    print(f"Testing translation: '{text}' -> '{target_lang}'")
    try:
        response = requests.get(url, params=params, headers=headers, timeout=5)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("Response Headers:", response.headers)
            try:
                data = response.json()
                print("Raw JSON:", json.dumps(data, ensure_ascii=False))
                
                translated_text = ""
                if data and isinstance(data, list) and len(data) > 0:
                    for sentence in data[0]:
                        if sentence and isinstance(sentence, list):
                            translated_text += sentence[0]
                print(f"Parsed Translation: {translated_text}")
            except Exception as e:
                print(f"JSON Parse Error: {e}")
                print("Raw Text:", response.text)
        else:
            print("Error Response:", response.text)
    except Exception as e:
        print(f"Request Error: {e}")

if __name__ == "__main__":
    test_translate("CAT", "gu")
    test_translate("HELLO", "hi")

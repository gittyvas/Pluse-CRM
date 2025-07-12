 import json

    raw_json_content = """
    {
      "type": "service_account",
      "project_id": "pulse-crm-60584",
      "private_key_id": "f27acc10ae9309c5b3806202a019d734f93e0947",
      "private_key": "-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCSZj3Z6RGWWqVp\\narv3zQvh0lAwBmuCmYvNzi+18hyH4gO7XNeZleSniDr9kISLMRA8Ze1baNzuvhOT\\nftcmWVHORqFO0c9I4NYG1I3P6u2xHtXcBg2lPKMKqlZQ5eecJAzq6bGk/iKAGuko\\ny+51vLPnN0GhdmGe8SHQc7PvlRIt5a/uIRUql2KbDKH3tOjQJ97tNFI5VQ18Ex+M\\nMgwcepo9X+54rBKGQi0QOr0w/mLoTnY5sXSR24Z7g8BtDjdSrOVr0Il3FpBIg1zr\\nxA2tbNcF3hrWToD7i2IHj1tkoudrQnDU79c8lAiRnFFuT9fTZjLiv9/S6XikwU8l\\nC0eeFVV7AgMBAAECggEAN1rJUDe8GqmzmaRt5kh1kbE/+Ki0xfDg17R6fcVJ3Gct\\nGg8ExmHSzzXHeFDIjQjEJtIzaTjBMNRV+pMfLrTfJau3GmJiih/ZTUPZSyB9N1d9\\nbXAsgKnozAOUF4qWhIdtCvXJ4aTlzqJePrq9M29iZq6R9kcYqkxqiLL2+kPXV9rK\\nwDySi66loujHxpGuM1sSIaHp3Dm3pIkqxhOXqaZG3PNYeHO7LsGlRU8Web/XNzIn\\nQX98TzVX/ivoKkEwagu98gG9vBeMay/xlgqjKViaiY8n6sipi8o7eJVOKSeytYbP\\n7/KvB3OzcESSwVPwG7Wd3907NWcwko7IzZ7kncaZQQKBgQDB+fy03zztuXQBPLH8\\nxqvXzTIbc8yB81Yo6WzweONgfEAHbw3HF8dUYehiN/Hr0S0GbrSKrmZH4qSNRCOj\\nUqYiqx+HPB5OrYdn4+1FwfSPcH/GL38ODqUSaGgEMOsyd+tAh/OOqPb/O0g0ut38\\npfHD4IUMSbU/jT4Ptc7BDDs+eQKBgQDBNc/26po0kMiTrdBqpFo1sIRY7Jat2c6I\\neYu7lwy0FJNYmNgRoqm/m7jsQhXAx8ZqrCHWmpZaXyTOWV/+C2OITZEmnheIcnu4\\nzTLL2IE07JXQJd/kb9C01eZE1DMPMFGNtHlheQOc/Kf3x4AOgVLx8rOK0ghmSChC\\nfQAWXn6mkwKBgQCjQnst5GIMlzUKwYHwhWomtH7C2kC68wqGXoihEK4XDBx75T1M\\nXzgWTl1fJUUJPEHQEycDPeu5/wiOGVaBZNONhEeB89hyUd0QVKbkOm1SuNXiASHH\\nvA21I4jAVkfubz3iT0pvvMg+Yy/PqaOivCxytypkADl7Zq5gXJ3KnzfRyQKBgBVh\\nMwYLp8yxSMCutyVV0nWmdr6wT2wlcelAKeo0KL+0lylyoFYzPb1qKeha17VhZd9f\\n9M6ehIyzgosi8LBX6kem7azsSYZbxL0KV9ieuI12sI07466PgPTBxp1PLec8XYnk\\nspnKnk+81YlhlhYE0XzccmmmHC/VRD83Pc873Z/pAoGANfI41cNLl+vFRXVPMhPk\\nLOcc1Q3F/604wxvElOeEgaj9+bm5QzWle22N04EDFGHzteRltCRf6hYDP4XtG6Y4\\nfTe43ZMoua3Pb/b0uACP4dcfO0FgS2r2x7xqseDiWPoADnyvvMJxN7ncj8GLZfo+\\nBb+SEvBDBdUCLb13fdBoFmI=\\n",
      "client_email": "firebase-adminsdk-fbsvc@pulse-crm-60584.iam.gserviceaccount.com",
      "client_id": "110956275021378282365",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40pulse-crm-60584.iam.gserviceaccount.com",
      "universe_domain": "googleapis.com"
    }
    """

    # Parse the raw JSON content
    data = json.loads(raw_json_content)

    # Strip any trailing newlines from the private_key value
    if "private_key" in data and isinstance(data["private_key"], str):
        data["private_key"] = data["private_key"].strip()

    # Convert it back to a JSON string, which will automatically escape newlines as \\n
    escaped_json_string = json.dumps(data)

    print(escaped_json_string)
    

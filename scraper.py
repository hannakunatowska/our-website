import json

def fix_swedish_chars(text):
    replacements = {
        'Ã¶': 'ö',
        'Ã¥': 'å',
        'Ã¤': 'ä',
        'Ã–': 'Ö'
    }
    for wrong, right in replacements.items():
        text = text.replace(wrong, right)
    return text


my_freq_list = []

with open("data.txt", "r", encoding="utf-8", errors="replace") as file:
    for line in file:
        if line and line[0].isdigit():
            line = line.strip()
            line = line.replace(",", ".")
            line = fix_swedish_chars(line)
            parts = line.split()

            if len(parts) >= 3:
                row = {
                    "startfrekvens": parts[0],
                    "slutfrekvens": parts[1],
                    "användningsområde": " ".join(parts[2:])
                }
                my_freq_list.append(row)

# Spara till JSON-fil
with open("frekvenser.json", "w", encoding="utf-8") as json_file:
    json.dump(my_freq_list, json_file, ensure_ascii=False, indent=4)
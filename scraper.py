import json
import re

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
        line = line.strip()
        if not line or not line[0].isdigit():
            continue  # skip empty lines or lines not starting with a digit

        line = fix_swedish_chars(line)
        line = line.replace(",", ".")  # decimal fix

        # Replace spaces **inside numbers** (digits surrounded by spaces)
        # Example: "1 215" -> "1215"
        line = re.sub(r'(\d) (\d)', r'\1\2', line)

        parts = line.split()
        if len(parts) < 3:
            continue  # skip if line doesn't have start, end, description

        startfrekvens = parts[0]
        slutfrekvens = parts[1]
        description = " ".join(parts[2:])
        # remove dublex frequencies
        description = re.split(r'\s\d', description, 1)[0].strip()


        row = {
            "startfrekvens": startfrekvens,
            "slutfrekvens": slutfrekvens,
            "användningsområde": description
        }
        my_freq_list.append(row)

# sort by startfrekvens as float
my_freq_list.sort(key=lambda x: float(x["startfrekvens"]))

with open("frekvenser.json", "w", encoding="utf-8") as json_file:
    json.dump(my_freq_list, json_file, ensure_ascii=False, indent=4)
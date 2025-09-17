import json # Import the json module so we can save our data as a JSON file

# Function to fix misencoded Swedish characters in text
def fix_swedish_chars(text):
    # Dictionary mapping incorrectly encoded characters to correct ones
    replacements = {
        'Ã¶': 'ö',
        'Ã¥': 'å',
        'Ã¤': 'ä',
        'Ã–': 'Ö'
    }
    # Loop through each wrong character and replace it in the text
    for wrong, right in replacements.items():
        text = text.replace(wrong, right)
    return text # Return the corrected text


my_freq_list = [] # Initialize an empty list to store each row as a dictionary

# Open the file data.txt for reading, using utf-8 encoding, replacing any invalid characters
with open("data.txt", "r", encoding="utf-8", errors="replace") as file:
    # Loop through each line in the file
    for line in file:
        # Only process lines that are not empty and start with a digit
        if line and line[0].isdigit():
            line = line.strip() # Remove leading/trailing whitespace
            line = line.replace(",", ".") # Replace commas with dots (decimal fix)
            line = fix_swedish_chars(line) # Fix any Swedish characters
            parts = line.split() # Split the line into parts based on whitespace

            # Only process lines with at least 3 parts (start, end, description)
            if len(parts) >= 3:
                row = {
                    "startfrekvens": parts[0], # First number in the line
                    "slutfrekvens": parts[1], # Second number in the line
                    "användningsområde": " ".join(parts[2:]) # The rest of the line as description
                }
                my_freq_list.append(row) # Add this dictionary to the list

# Save the list of dictionaries as a JSON file
with open("frekvenser.json", "w", encoding="utf-8") as json_file:
    json.dump(my_freq_list, json_file, ensure_ascii=False, indent=4) # Pretty-print JSON with UTF-8
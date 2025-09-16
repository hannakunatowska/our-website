with open("data.txt", "r", encoding="utf-8", errors="replace") as file:
    my_freq_list = []

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

    def extract_freq(line):
        # Rensa upp
        line = line.strip()
        line = line.replace(",", ".")
        line = fix_swedish_chars(line)

        # Dela upp i kolumner (oavsett mellanrum/tabbar)
        parts = line.split()

        if len(parts) >= 3:
            första_frekvens = parts[0]
            sista_frekvens = parts[1]
            användningsområde = parts[2]

            # Om det finns exakt 2 extra siffror → tolka som dublexband
            if len(parts) == 5:
                dublex_start = parts[3]
                dublex_slut = parts[4]
                rad = [första_frekvens, sista_frekvens, användningsområde, dublex_start, dublex_slut]
            else:
                # Allt efter de tre första slås ihop som användningsområde
                if len(parts) > 3:
                    användningsområde = " ".join(parts[2:])
                rad = [första_frekvens, sista_frekvens, användningsområde]

            my_freq_list.append(rad)

    for line in file:
        if line and line[0].isdigit():
            extract_freq(line)

# Skriv ut resultatet snyggt
for item in my_freq_list:
    print(item)
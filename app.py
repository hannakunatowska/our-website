
# --- Imports ---

from flask import Flask, render_template, jsonify # Imports Flask (which is the main class used to create the web app), render_template (which makes it possible to return HTML file from "templates/") and jsonify (which turns Python dictionaries/lists into JSON responses)
import requests # Imports the request library which makes it easy to fetch data from other websites

# --- App ---

app = Flask(__name__, static_folder = "static", template_folder = "templates") # Creates Flask app object and specifies where it lives and where it will look for files

@app.route("/") # Route decorator which states that the code below should run when a user goes to "/" (i.e visits the homepage)

def index():

    """
    Returns the file "templates/index.html" to the browser.

    Arguments:
        None

    Returns:
        "render_template("index.html")": 

    """
    return render_template("index.html")

# Optional: server-side proxy to avoid CORS when fetching PTS JSON
# Replace PTS_JSON_URL with the real endpoint you found in the PTS app.
PTS_JSON_URL = "https://frekvensplanen.pts.se/PASTE_API_URL_HERE"

@app.route("/api/pts") # Route decorator which states that the code below should run when a user goes to "/api/pts" 

def pts_proxy():

    """
    Fetches the JSON data from the PTS API and returns it to the browser.

    Arguments:
        None

    Returns:
        "jsonify(r.json())":
        "jsonify({"error": str(e)}), 502": 

    """

    try: # Try to...
        r = requests.get(PTS_JSON_URL, timeout = 10) # Fetch the JSON from PTS (with a 10 second timeout)
        r.raise_for_status() # Raise an error if the HTTP response wasn't "200 OK" (HTTP status code which means that the request succeeded)
        print("Status code from PTS:", r.status_code) # Print the status code to the console
        return jsonify(r.json()) # Send the JSON data back to the browser
    
    except Exception as e: # If that doesn't work:
        return jsonify({"error": str(e)}), 502 # Return an error in JSON format with the status code "502" (which means "bad gateway")

if __name__ == "__main__": # If app.py is run directly (i.e not imported as a module in another file):
    app.run(host = "127.0.0.1", port = 5000, debug = True)

// Loading the frequency data

fetch("static/data.json") // Fetch the frequency band data from JSON file "data.json"
    .then(response => response.json()) // Then convert the response from JSON text to JavaScript object
    .then(data => { // Then use the data
        bands = data; // Store the data in the global variable "bands"
        renderCards(bands); // Call the function to render the band cards using the data
        renderTimeline(bands); // Call the function to render the timeline bars using the data
    })

    .catch(err => console.error("Error loading data:", err)); // Catch and log any errors that occur during the fetch process
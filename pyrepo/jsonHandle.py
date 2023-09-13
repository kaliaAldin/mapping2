import json

# Load the JSON data from the file
with open('data.json', 'r') as json_file:
    data = json.load(json_file)

# Function to add a "status" key to each hospital
def add_status(hospital):
    # You can customize this function to set the status based on your criteria
    # For demonstration purposes, we'll set a dummy status here.
    hospital['status'] = 'Operational'  # Replace with the actual status

# Iterate through hospitals and add the "status" key
for hospital in data['Hospitals']:
    add_status(hospital)

# Save the updated JSON data back to the file
with open('data.json', 'w') as json_file:
    json.dump(data, json_file, indent=2)

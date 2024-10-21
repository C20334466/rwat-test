document.getElementById('sync').addEventListener('click', fetchDataSync);
document.getElementById('async').addEventListener('click', fetchDataAsync);
document.getElementById('fetch').addEventListener('click', fetchDataWithPromises);

// Function to display the data in a table
function displayData(data) {
    const tbody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
    tbody.innerHTML = ''; // Clear previous data

    data.forEach(item => {
        const [firstName, lastName] = item.name.split(' ');
        const row = `<tr>
                        <td>${firstName}</td>
                        <td>${lastName}</td>
                        <td>${item.id}</td>
                    </tr>`;
        tbody.innerHTML += row;
    });
}

// Synchronous XMLHttpRequest
function fetchDataSync() {
    try {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", "data/reference.json", false); // Synchronous request for reference
        xhr.send();

        if (xhr.status === 200) {
            const reference = JSON.parse(xhr.responseText);
            const data1 = fetchSync(`data/${reference.data_location}`);
            const data2 = fetchSync(`data/${data1.data_location}`);
            const data3 = fetchSync('data/data3.json');
            
            const combinedData = [...data1.data, ...data2.data, ...data3.data];
            displayData(combinedData);
        }
    } catch (error) {
        console.error("Error fetching data synchronously", error);
    }
}

// Function to fetch data synchronously
function fetchSync(url) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);  // Using the full URL path
    xhr.send();

    if (xhr.status === 200) {
        return JSON.parse(xhr.responseText);
    } else {
        console.error("Error fetching URL:", url, "Status:", xhr.status);
        return null; // Return null if there was an error
    }
}

// Asynchronous XMLHttpRequest with callbacks
function fetchDataAsync() {
    fetchAsync('data/reference.json', (reference) => {
        fetchAsync(`data/${reference.data_location}`, (data1) => {
            fetchAsync(`data/${data1.data_location}`, (data2) => {
                fetchAsync('data/data3.json', (data3) => {
                    const combinedData = [...data1.data, ...data2.data, ...data3.data];
                    displayData(combinedData);
                });
            });
        });
    });
}

// Function to fetch data asynchronously with a callback
function fetchAsync(url, callback) {
    const xhr = new XMLHttpRequest();
    console.log("Fetching URL:", url);  // Debugging: Log the URL
    xhr.open("GET", url, true);  // Using the URL directly
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    callback(response);
                } catch (error) {
                    console.error("Error parsing JSON from:", url, error);
                }
            } else {
                console.error("Error fetching URL:", url, "Status:", xhr.status);
            }
        }
    };
    xhr.send();
}

// Fetch API with Promises
function fetchDataWithPromises() {
    fetch("data/reference.json")
        .then(response => response.json())
        .then(reference => fetch(`data/${reference.data_location}`))
        .then(response => response.json())
        .then(data1 => fetch(`data/${data1.data_location}`).then(response => response.json()).then(data2 => ({data1, data2})))
        .then(({data1, data2}) => fetch('data/data3.json').then(response => response.json()).then(data3 => ({data1, data2, data3})))
        .then(({data1, data2, data3}) => {
            const combinedData = [...data1.data, ...data2.data, ...data3.data];
            displayData(combinedData);
        })
        .catch(error => console.error("Error fetching data with Fetch API", error));
}

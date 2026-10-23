
const API_URL = "http://localhost:5115/api/traffic";

let isRunning = false;

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");
const addVehicleBtn = document.getElementById("addVehicleBtn");
const removeVehicleBtn = document.getElementById("removeVehicleBtn");

const simulationStatus = document.getElementById("simulationStatus");
const queueMessage = document.getElementById("queueMessage");

// Load dashboard information from the API.
async function loadTrafficData() {
    try {
        const response = await fetch(`${API_URL}/status`);

        if (!response.ok) {
            throw new Error("Could not load traffic status.");
        }

        const data = await response.json();

        isRunning = data.isRunning;

        document.getElementById("vehicles").textContent =
            data.totalVehicles;

        document.getElementById("waiting").textContent =
            data.averageWaitingSeconds;

        document.getElementById("signals").textContent =
            data.activeSignals;

        document.getElementById("congestion").textContent =
            data.congestionLevel;

        simulationStatus.textContent = isRunning
            ? "Simulation running"
            : "Simulation stopped";

        const table = document.getElementById("intersectionTable");
        table.innerHTML = "";

        data.intersections.forEach(function (intersection) {
            const row = document.createElement("tr");

            const nameCell = document.createElement("td");
            nameCell.textContent = intersection.name;

            const vehiclesCell = document.createElement("td");
            vehiclesCell.textContent = intersection.vehicles;

            const signalCell = document.createElement("td");
            signalCell.textContent = intersection.signal;

            const statusCell = document.createElement("td");
            statusCell.textContent = intersection.status;

            row.appendChild(nameCell);
            row.appendChild(vehiclesCell);
            row.appendChild(signalCell);
            row.appendChild(statusCell);

            table.appendChild(row);
        });
    } catch (error) {
        simulationStatus.textContent =
            "Cannot connect to the API. Check that the backend is running.";

        console.error(error);
    }
}

// Load vehicle queue and adaptive green time.
async function loadQueueData() {
    try {
        const response = await fetch(`${API_URL}/queue`);

        if (!response.ok) {
            throw new Error("Could not load queue data.");
        }

        const data = await response.json();

        document.getElementById("queueLength").textContent =
            data.queueLength;

        document.getElementById("greenTime").textContent =
            data.greenTimeSeconds;

        const vehicleList = document.getElementById("vehicleList");
        vehicleList.innerHTML = "";

        if (data.vehicles.length === 0) {
            const item = document.createElement("li");
            item.textContent = "No vehicles in the queue.";
            vehicleList.appendChild(item);
        } else {
            data.vehicles.forEach(function (vehicleId, index) {
                const item = document.createElement("li");
                item.textContent =
                    `Position ${index + 1}: Vehicle ${vehicleId}`;

                vehicleList.appendChild(item);
            });
        }
    } catch (error) {
        queueMessage.textContent =
            "Could not load vehicle queue. Check the backend.";

        console.error(error);
    }
}

// Send a command to the backend.
async function sendCommand(command) {
    try {
        const response = await fetch(`${API_URL}/${command}`, {
            method: "POST"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Command failed.");
        }

        queueMessage.textContent = data.message || "Command completed.";

        await loadTrafficData();
        await loadQueueData();
    } catch (error) {
        queueMessage.textContent = error.message;
        console.error(error);
    }
}

// Start simulation.
startBtn.addEventListener("click", function () {
    sendCommand("start");
});

// Stop simulation.
stopBtn.addEventListener("click", function () {
    sendCommand("stop");
});

// Reset simulation and clear the vehicle queue.
resetBtn.addEventListener("click", function () {
    sendCommand("reset");
});

// Add a vehicle to the FIFO queue.
addVehicleBtn.addEventListener("click", async function () {
    await sendCommand("vehicle/add");
});

// Remove the first vehicle from the FIFO queue.
removeVehicleBtn.addEventListener("click", async function () {
    await sendCommand("vehicle/remove");
});

// Load data when the page opens.
loadTrafficData();
loadQueueData();

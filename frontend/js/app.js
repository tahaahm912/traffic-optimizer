
const API_URL = "http://localhost:5115/api/traffic";

let isRunning = false;

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");
const addVehicleBtn = document.getElementById("addVehicleBtn");
const removeVehicleBtn = document.getElementById("removeVehicleBtn");

const simulationStatus = document.getElementById("simulationStatus");
const queueMessage = document.getElementById("queueMessage");

function renderMapSignals(intersections) {
    const signalIds = ["A", "B", "C", "D"];

    signalIds.forEach(function (id, index) {
        const signalElement = document.getElementById(
            "mapSignal" + id
        );

        const intersection = intersections[index];

        if (!intersection || !signalElement) {
            return;
        }

        const signal = intersection.signal.toLowerCase();

        signalElement.className = "map-signal";

        if (signal === "red") {
            signalElement.classList.add("red");
        } else if (signal === "yellow") {
            signalElement.classList.add("yellow");
        } else {
            signalElement.classList.add("green");
        }
    });
}

function renderMapVehicles(vehicles) {
    const mapVehicles = document.getElementById("mapVehicles");
    const mapMessage = document.getElementById("mapMessage");

    mapVehicles.innerHTML = "";

    const visibleVehicles = vehicles.slice(0, 15);

    visibleVehicles.forEach(function (vehicleId, index) {
        const car = document.createElement("div");

        car.className = "map-car";
        car.style.left = (4 + index * 4) + "%";
        car.style.top = "32%";
        car.title = "Vehicle " + vehicleId;

        mapVehicles.appendChild(car);
    });

    mapMessage.textContent =
        vehicles.length + " vehicles in the backend queue. " +
        "Showing " + visibleVehicles.length + " on the map.";
}

// Load dashboard information from the API.
async function loadTrafficData() {
    try {
        const response = await fetch(`${API_URL}/status`);

        if (!response.ok) {
            throw new Error("Could not load traffic status.");
        }

        const data = await response.json();
        renderMapSignals(data.intersections);

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

async function loadNetworkData() {
    const response = await fetch(API_URL + "/network");

    if (!response.ok) {
        throw new Error("Failed to load road network");
    }

    const data = await response.json();

    const intersectionList = document.getElementById("networkIntersections");
    const roadList = document.getElementById("roadList");

    intersectionList.innerHTML = "";
    roadList.innerHTML = "";

    data.intersections.forEach(function (intersection) {
        const item = document.createElement("li");

        item.textContent =
            intersection.name +
            " — " + intersection.vehicleCount + " vehicles" +
            " — Signal: " + intersection.signal.state;

        intersectionList.appendChild(item);
    });

    data.roads.forEach(function (road) {
        const card = document.createElement("div");
        card.className = "road-card";

        const details = document.createElement("p");
        details.textContent =
            road.name + " (" +
            road.startIntersectionId + " → " +
            road.endIntersectionId + ")" +
            " — " + road.lengthMeters + " m";

        const status = document.createElement("p");
        status.textContent = road.isBlocked ? "Status: Blocked" : "Status: Open";

        const button = document.createElement("button");
        button.textContent = road.isBlocked ? "Reopen Road" : "Block Road";

        button.addEventListener("click", async function () {
            button.disabled = true;

            try {
                const updateResponse = await fetch(
                    API_URL + "/road/block",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            roadId: road.id,
                            isBlocked: !road.isBlocked
                        })
                    }
                );

                if (!updateResponse.ok) {
                    throw new Error("Could not update road status");
                }

                await loadNetworkData();
            } catch (error) {
                console.error(error);
                alert("Failed to update road. Check that the API is running.");
                button.disabled = false;
            }
        });

        card.appendChild(details);
        card.appendChild(status);
        card.appendChild(button);
        roadList.appendChild(card);
    });
}

// Load vehicle queue and adaptive green time.
async function loadQueueData() {
    try {
        const response = await fetch(`${API_URL}/queue`);

        if (!response.ok) {
            throw new Error("Could not load queue data.");
        }

        const data = await response.json();
        renderMapVehicles(data.vehicles);

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
loadNetworkData().catch(function (error) {
    console.error("Network loading error:", error);
});
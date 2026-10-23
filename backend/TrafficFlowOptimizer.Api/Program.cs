
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(
            "http://127.0.0.1:5500",
            "http://localhost:5500"
        )
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

builder.Services.AddSingleton<TrafficSimulation>();

var app = builder.Build();

app.UseCors("FrontendPolicy");

bool isRunning = false;

var intersections = new[]
{
    new { name = "Intersection A", vehicles = 25, signal = "Green", status = "Moving" },
    new { name = "Intersection B", vehicles = 40, signal = "Red", status = "Waiting" },
    new { name = "Intersection C", vehicles = 30, signal = "Green", status = "Moving" },
    new { name = "Intersection D", vehicles = 25, signal = "Red", status = "Waiting" }
};

app.MapGet("/", () =>
{
    return Results.Ok(new
    {
        message = "Traffic Flow Optimizer API is running"
    });
});

app.MapGet("/api/traffic/status", () =>
{
    return Results.Ok(new
    {
        isRunning = isRunning,
        totalVehicles = 120,
        averageWaitingSeconds = 35,
        activeSignals = 4,
        congestionLevel = "Medium",
        intersections = intersections
    });
});

app.MapPost("/api/traffic/start", () =>
{
    isRunning = true;

    return Results.Ok(new
    {
        message = "Simulation started",
        isRunning = isRunning
    });
});

app.MapPost("/api/traffic/stop", () =>
{
    isRunning = false;

    return Results.Ok(new
    {
        message = "Simulation stopped",
        isRunning = isRunning
    });
});

app.MapPost("/api/traffic/reset", (TrafficSimulation simulation) =>
{
    isRunning = false;

    while (simulation.GetQueueLength() > 0)
    {
        simulation.RemoveVehicle();
    }

    return Results.Ok(new
    {
        message = "Simulation reset",
        isRunning = isRunning,
        queueLength = simulation.GetQueueLength()
    });
});

// Get the vehicle queue and adaptive green time.
app.MapGet("/api/traffic/queue", (TrafficSimulation simulation) =>
{
    return Results.Ok(simulation.GetStatus());
});

// Add a vehicle to the queue.
app.MapPost("/api/traffic/vehicle/add", (TrafficSimulation simulation) =>
{
    string vehicleId = Guid.NewGuid().ToString("N")[..8];

    simulation.AddVehicle(vehicleId);

    return Results.Ok(new
    {
        message = "Vehicle added",
        vehicleId = vehicleId,
        queue = simulation.GetStatus()
    });
});

// Remove the first vehicle from the queue.
app.MapPost("/api/traffic/vehicle/remove", (TrafficSimulation simulation) =>
{
    string? vehicleId = simulation.RemoveVehicle();

    if (vehicleId == null)
    {
        return Results.BadRequest(new
        {
            message = "The vehicle queue is empty"
        });
    }

    return Results.Ok(new
    {
        message = "Vehicle removed",
        vehicleId = vehicleId,
        queue = simulation.GetStatus()
    });
});

app.Run();

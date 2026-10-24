
namespace TrafficFlowOptimizer.Api.Models;

public class Intersection
{
    public string Id { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public int VehicleCount { get; set; }

    public TrafficSignal Signal { get; set; } = new();

    public string Status { get; set; } = "Waiting";
}

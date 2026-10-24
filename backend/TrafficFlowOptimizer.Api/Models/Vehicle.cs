
namespace TrafficFlowOptimizer.Api.Models;

public class Vehicle
{
    public string Id { get; set; } = string.Empty;

    public string CurrentIntersectionId { get; set; } = string.Empty;

    public string DestinationIntersectionId { get; set; } = string.Empty;

    public int WaitingTimeSeconds { get; set; }

    public bool IsEmergency { get; set; }
}

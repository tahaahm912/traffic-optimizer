
namespace TrafficFlowOptimizer.Api.Models;

public class Road
{
    public string Id { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string StartIntersectionId { get; set; } = string.Empty;

    public string EndIntersectionId { get; set; } = string.Empty;

    public double LengthMeters { get; set; }

    public bool IsBlocked { get; set; }

    public int SpeedLimitKmh { get; set; } = 40;
}


namespace TrafficFlowOptimizer.Api.Models;

public class TrafficSignal
{
    public string Id { get; set; } = string.Empty;

    public string State { get; set; } = "Red";

    public int GreenTimeSeconds { get; set; } = 10;

    public int RedTimeSeconds { get; set; } = 30;
}

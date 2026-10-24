
using System;
using System.Collections.Generic;
using System.Linq;
using TrafficFlowOptimizer.Api.Models;

public class TrafficSimulation
{
    private Queue<Vehicle> vehicles;
    private List<Intersection> intersections;
    private List<Road> roads;
    private int minimumGreenTime;
    private int maximumGreenTime;

    public TrafficSimulation(
        int minimumGreenTime = 10,
        int maximumGreenTime = 60)
    {
        this.vehicles = new Queue<Vehicle>();
        this.minimumGreenTime = minimumGreenTime;
        this.maximumGreenTime = maximumGreenTime;

        this.intersections = new List<Intersection>
        {
            new Intersection
            {
                Id = "A",
                Name = "Intersection A",
                VehicleCount = 25,
                Signal = new TrafficSignal
                {
                    Id = "Signal-A",
                    State = "Green",
                    GreenTimeSeconds = 20,
                    RedTimeSeconds = 30
                },
                Status = "Moving"
            },
            new Intersection
            {
                Id = "B",
                Name = "Intersection B",
                VehicleCount = 40,
                Signal = new TrafficSignal
                {
                    Id = "Signal-B",
                    State = "Red",
                    GreenTimeSeconds = 20,
                    RedTimeSeconds = 30
                },
                Status = "Waiting"
            },
            new Intersection
            {
                Id = "C",
                Name = "Intersection C",
                VehicleCount = 30,
                Signal = new TrafficSignal
                {
                    Id = "Signal-C",
                    State = "Green",
                    GreenTimeSeconds = 20,
                    RedTimeSeconds = 30
                },
                Status = "Moving"
            },
            new Intersection
            {
                Id = "D",
                Name = "Intersection D",
                VehicleCount = 25,
                Signal = new TrafficSignal
                {
                    Id = "Signal-D",
                    State = "Red",
                    GreenTimeSeconds = 20,
                    RedTimeSeconds = 30
                },
                Status = "Waiting"
            }
        };

        this.roads = new List<Road>
        {
            new Road
            {
                Id = "R1",
                Name = "Road A-B",
                StartIntersectionId = "A",
                EndIntersectionId = "B",
                LengthMeters = 500,
                SpeedLimitKmh = 40
            },
            new Road
            {
                Id = "R2",
                Name = "Road B-C",
                StartIntersectionId = "B",
                EndIntersectionId = "C",
                LengthMeters = 650,
                SpeedLimitKmh = 40
            },
            new Road
            {
                Id = "R3",
                Name = "Road C-D",
                StartIntersectionId = "C",
                EndIntersectionId = "D",
                LengthMeters = 400,
                SpeedLimitKmh = 30
            },
            new Road
            {
                Id = "R4",
                Name = "Road D-A",
                StartIntersectionId = "D",
                EndIntersectionId = "A",
                LengthMeters = 700,
                SpeedLimitKmh = 40
            }
        };
    }

    public void AddVehicle(string vehicleId)
    {
        Vehicle vehicle = new Vehicle
        {
            Id = vehicleId,
            CurrentIntersectionId = "A",
            DestinationIntersectionId = "D",
            WaitingTimeSeconds = 0,
            IsEmergency = false
        };

        this.vehicles.Enqueue(vehicle);
    }

    public string? RemoveVehicle()
    {
        if (this.vehicles.Count == 0)
        {
            return null;
        }

        Vehicle vehicle = this.vehicles.Dequeue();

        return vehicle.Id;
    }

    public int GetQueueLength()
    {
        return this.vehicles.Count;
    }

    public int CalculateGreenTime()
    {
        int greenTime = 10 + (this.vehicles.Count * 2);

        if (greenTime < this.minimumGreenTime)
        {
            greenTime = this.minimumGreenTime;
        }

        if (greenTime > this.maximumGreenTime)
        {
            greenTime = this.maximumGreenTime;
        }

        return greenTime;
    }

    // Keeps the existing dashboard response format.
    public object GetDashboardIntersections()
    {
        return this.intersections.Select(intersection => new
        {
            id = intersection.Id,
            name = intersection.Name,
            vehicles = intersection.VehicleCount,
            signal = intersection.Signal.State,
            status = intersection.Status
        }).ToArray();
    }

    // Returns the structured network models for the API.
    public object GetNetwork()
    {
        return new
        {
            intersections = this.intersections,
            roads = this.roads
        };
    }

    // Keeps the existing queue response format.
    public object GetStatus()
    {
        return new
        {
            queueLength = this.vehicles.Count,
            greenTimeSeconds = this.CalculateGreenTime(),
            vehicles = this.vehicles.Select(vehicle => vehicle.Id).ToArray()
        };
    }
    public bool SetRoadBlocked(string roadId, bool isBlocked)
    {
        Road? road = this.roads.FirstOrDefault(
            road => road.Id.Equals(
                roadId,
                StringComparison.OrdinalIgnoreCase));
    
        if (road == null)
        {
            return false;
        }
    
        road.IsBlocked = isBlocked;
        return true;
    }
}

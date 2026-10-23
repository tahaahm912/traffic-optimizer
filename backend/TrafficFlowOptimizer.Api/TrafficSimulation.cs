
using System;
using System.Collections.Generic;
using System.Linq;

public class TrafficSimulation
{
    private Queue<string> vehicles;
    private int minimumGreenTime;
    private int maximumGreenTime;

    public TrafficSimulation(int minimumGreenTime = 10,
                             int maximumGreenTime = 60)
    {
        this.vehicles = new Queue<string>();
        this.minimumGreenTime = minimumGreenTime;
        this.maximumGreenTime = maximumGreenTime;
    }

    public void AddVehicle(string vehicleId)
    {
        this.vehicles.Enqueue(vehicleId);
    }

    public string? RemoveVehicle()
    {
        if (this.vehicles.Count == 0)
        {
            return null;
        }

        return this.vehicles.Dequeue();
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

    public object GetStatus()
    {
        return new
        {
            queueLength = this.vehicles.Count,
            greenTimeSeconds = this.CalculateGreenTime(),
            vehicles = this.vehicles.ToArray()
        };
    }
}

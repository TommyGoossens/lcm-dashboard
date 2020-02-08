using System;
using Newtonsoft.Json;

namespace LifeCycleManagerDashboard.Models.LifeCycleManager
{
    public class LifeCycleManagerDetailView : LifeCycleManagerListView
    {
        public double Longitude { get; private set; }

        public double Latitude { get; private set; }

        [JsonConstructor]
        public LifeCycleManagerDetailView(double longitude, double latitude, string connectionState, string applicationState, string deviceId,
            string project, string location, DateTime lastActivityTime, string firmware)
            : base(connectionState, applicationState, deviceId, project, location, lastActivityTime, firmware)
        {
            this.Longitude = longitude;
            this.Latitude = latitude;
        }
    }
}
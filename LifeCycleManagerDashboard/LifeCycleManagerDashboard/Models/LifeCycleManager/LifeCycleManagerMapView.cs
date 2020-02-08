using Newtonsoft.Json;

namespace LifeCycleManagerDashboard.Models.LifeCycleManager
{
    public class LifeCycleManagerMapView : LifeCycleManagerBase
    {
        public double Longitude { get; }

        public double Latitude { get; }

        public DeviceAddress Address { get; }

        [JsonConstructor]
        public LifeCycleManagerMapView(string connectionState, string deviceId, string project,
            double longitude, double latitude, string applicationState, string location, DeviceAddress address)
            : base(connectionState, deviceId, project, applicationState, location)
        {
            this.Longitude = longitude;
            this.Latitude = latitude;
            this.Address = address;
        }
    }
}
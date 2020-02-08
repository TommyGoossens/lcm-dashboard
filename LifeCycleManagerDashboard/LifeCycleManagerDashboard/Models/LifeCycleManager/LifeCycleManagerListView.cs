using Newtonsoft.Json;
using System;

namespace LifeCycleManagerDashboard.Models.LifeCycleManager
{
    public class LifeCycleManagerListView : LifeCycleManagerBase
    {
        public DateTime LastActivityTime { get; private set; }

        public string Firmware { get; private set; }

        [JsonConstructor]
        public LifeCycleManagerListView(string connectionState, string applicationState, string deviceId,
            string project, string location, DateTime lastActivityTime, string firmware)
            : base(connectionState, deviceId, project, applicationState, location)
        {
            this.LastActivityTime = lastActivityTime;
            this.Firmware = firmware;
        }
    }
}
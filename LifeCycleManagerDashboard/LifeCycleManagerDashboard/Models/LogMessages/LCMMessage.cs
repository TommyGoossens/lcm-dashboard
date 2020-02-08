using System;

namespace LifeCycleManagerDashboard.Models.LogMessages
{
    public class LCMMessage
    {
        public long Id { get; set; }

        public string DeviceIdentifier { get; set; }

        public string ApplicationName { get; set; }

        public DateTime DateTime { get; set; }

        public string Type { get; set; }

        public string Content { get; set; }
    }
}
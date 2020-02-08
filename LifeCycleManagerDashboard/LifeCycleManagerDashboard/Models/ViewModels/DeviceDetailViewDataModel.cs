using System.Collections.Generic;
using System.Linq;
using LifeCycleManagerDashboard.Models.LifeCycleManager;
using LifeCycleManagerDashboard.Models.LogMessages;
using Newtonsoft.Json;

namespace LifeCycleManagerDashboard.Models.ViewModels
{
    public class DeviceDetailViewDataModel
    {
        public LifeCycleManagerDetailView Device { get; private set; }

        public LifeCycleManagerStatistics Statistics { get; private set; }

        public List<string> Commands { get; private set; }

        public List<LCMLoggingMessage> LogMessages { get; private set; }
        public string ApplicationName => LogMessages.Last().ApplicationName;

        [JsonConstructor]
        public DeviceDetailViewDataModel(LifeCycleManagerDetailView device, LifeCycleManagerStatistics statistics,
            List<string> commands, List<LCMLoggingMessage> logMessages)
        {
            this.Device = device;
            this.Statistics = statistics;
            this.Commands = commands;
            this.LogMessages = logMessages;
        }
    }

    public class LifeCycleManagerStatistics
    {
        public string ApplicationName { get; set; }
        public string Uptime { get; set; }
        public string DiskUsage { get; set; }
        public string CpuUsage { get; set; }
        public string RamUsage { get; set; }
    }
}
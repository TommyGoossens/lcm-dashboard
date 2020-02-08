using System.Collections.Generic;
using Newtonsoft.Json;

namespace LifeCycleManagerDashboard.Models.ViewModels
{
    public class DeviceConfigViewModel
    {
        [JsonProperty(PropertyName = "Intervals")]
        public Dictionary<string, object> Intervals { get; set; }

        [JsonProperty(PropertyName = "NumberOfIOControllers")]
        public int NumberOfIOControllers => IOControllers.Count;

        [JsonProperty(PropertyName = "IOControllers")]
        public List<Dictionary<string, object>> IOControllers;

        [JsonProperty(PropertyName = "NumberOfPowerSupplies")]
        public int NumberOfPowerSupplies => PowerSupplies.Count;

        [JsonProperty(PropertyName = "PowerSupplies")]
        public List<Dictionary<string, object>> PowerSupplies;

        [JsonProperty(PropertyName = "NumberOfPrograms")]
        public int NumberOfPrograms => Programs.Count;

        [JsonProperty(PropertyName = "Programs")]
        public List<Dictionary<string, object>> Programs;


        public DeviceConfigViewModel()
        {
            Intervals = new Dictionary<string, object>();
            IOControllers = new List<Dictionary<string, object>>();
            PowerSupplies = new List<Dictionary<string, object>>();
            Programs = new List<Dictionary<string, object>>();
        }
    }
}
using System.Collections.Generic;
using LifeCycleManagerDashboard.Models.LifeCycleManager;
using LifeCycleManagerDashboard.Properties;

namespace LifeCycleManagerDashboard.Models.ViewModels
{
    public class MapViewModel
    {
        public List<LifeCycleManagerMapView> LifeCycleManagers { get; private set; }

        public LifeCycleManagerBase SelectedDevice { get; set; }
        public List<string> Provinces => Constants.Provinces;
        public List<string> Statuses => Constants.DeviceStatuses;
        public List<string> Projects { get; set; }

        public MapViewModel(List<LifeCycleManagerMapView> lifeCycleManagers)
        {
            this.LifeCycleManagers = lifeCycleManagers;
        }
    }
}
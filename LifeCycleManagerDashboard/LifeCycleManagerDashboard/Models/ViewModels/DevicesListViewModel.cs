using LifeCycleManagerDashboard.Models.Filters;
using LifeCycleManagerDashboard.Models.LifeCycleManager;
using System.Collections.Generic;

namespace LifeCycleManagerDashboard.Models.ViewModels
{
    public class DevicesListViewModel
    {
        public List<LifeCycleManagerListView> Devices { get; set; }

        public long NumberOfPages { get; set; }

        public DevicesFilter Filter { get; set; }

        public DevicesListViewModel(List<LifeCycleManagerListView> devices, long numberOfPages)
        {
            this.Devices = devices;
            this.NumberOfPages = numberOfPages;
        }
    }
}
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LifeCycleManagerDashboard.Filters;
using LifeCycleManagerDashboard.Models;
using LifeCycleManagerDashboard.Models.LifeCycleManager;
using LifeCycleManagerDashboard.Models.ViewModels;
using LifeCycleManagerDashboard.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Web;
using Newtonsoft.Json;
using NLog;

namespace LifeCycleManagerDashboard.Controllers
{
    [Authorize]
    [TypeFilter(typeof(NoConnectionExceptionFilter))]
    [Route("[controller]")]
    public class MapViewController : Controller
    {
        private readonly IRestService restService;
        private static readonly Logger Logger = LogManager.GetCurrentClassLogger();

        public MapViewController(IRestService restService)
        {
            this.restService = restService;
        }

        /// <summary>
        /// url: /MapView
        /// Retrieves the map view.
        /// </summary>
        /// <returns>View containing the map UI</returns>
        [HttpGet("/")]
        [AuthorizeForScopes(ScopeKeySection = "Permissions:UserRead")]
        public async Task<ViewResult> Index()
        {
            MapViewModel model = new MapViewModel(await GetDevices())
            {
                Projects = await GetProjectNames()
            };
            return View("MapView", model);
        }

        /// <summary>
        /// url: /mapview?deviceId={deviceId}
        /// Focuses the map on the requested device.
        /// Will default to the overview if it has no gps (done by javascript
        /// </summary>
        /// <param name="deviceId">Name of the device</param>
        /// <returns>View containing the map UI</returns>
        [HttpGet("[action]")]
        [AuthorizeForScopes(ScopeKeySection = "Permissions:UserRead")]
        public async Task<ViewResult> Device(string deviceId)
        {
            MapViewModel result = new MapViewModel(await GetDevices())
            {
                Projects = await GetProjectNames()
            };
            result.SelectedDevice = result.LifeCycleManagers.Find(d => d.DeviceId.Equals(deviceId));
            return View("MapView", result);
        }

        /// <summary>
        /// Retrieves the projects from the backend and returns their names
        /// </summary>
        /// <returns>List of strings (project names)</returns>
        private async Task<List<string>> GetProjectNames()
        {
            string httpResponse = await restService.GetRequest("/api/projects");
            List<Project> projects = JsonConvert.DeserializeObject<List<Project>>(httpResponse);
            return projects.Select(project => project.Name).ToList();
        }

        /// <summary>
        /// Retrieves a list of LCM Devices from the backend server asynchronously.
        /// </summary>
        /// <returns>List of all LCM devices</returns>
        private async Task<List<LifeCycleManagerMapView>> GetDevices()
        {
            string httpResponse = await restService.GetRequest("/api/devices");
            return JsonConvert.DeserializeObject<List<LifeCycleManagerMapView>>(httpResponse);
        }
    }
}
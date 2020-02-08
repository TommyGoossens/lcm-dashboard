using LifeCycleManagerDashboard.Filters;
using LifeCycleManagerDashboard.Models.Filters;
using LifeCycleManagerDashboard.Models.LifeCycleManager;
using LifeCycleManagerDashboard.Models.ViewModels;
using LifeCycleManagerDashboard.Services;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using NLog;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Identity.Web;

namespace LifeCycleManagerDashboard.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [TypeFilter(typeof(NoConnectionExceptionFilter))]
    public class DevicesListViewController : Controller
    {
        private readonly IRestService restService;
        private static readonly Logger Logger = LogManager.GetCurrentClassLogger();

        public DevicesListViewController(IRestService restService)
        {
            this.restService = restService;
        }

        [HttpGet]
        [AuthorizeForScopes(ScopeKeySection = "Permissions:UserRead")]
        public IActionResult Index(int page, int items, string name = "", string project = "", string status = "")
        {
            if (page <= 0)
            {
                page = 1;
            }

            if (items <= 0)
            {
                items = 25;
            }

            ViewBag.ItemsPerPage = items;
            ViewBag.PageNumber = page;
            return View("DevicesListView", FilterDevices(new DevicesFilter(page, items, name, project, status)).Result);
        }

        /// <summary>
        /// Filter endpoint which redirects to the regular index view.
        /// </summary>
        /// <param name="filter">containing pagenumber, itemcount, name, project and status</param>
        /// <returns>Redirect to the Index with the correct filter options</returns>
        [HttpPost("Filter")]
        [AuthorizeForScopes(ScopeKeySection = "Permissions:UserRead")]
        public IActionResult Filter(DevicesFilter filter)
        {
            if (filter.Project == null)
            {
                filter.Project = "";
            }

            if (filter.Name == null)
            {
                filter.Name = "";
            }

            return RedirectToAction("Index",
                new
                {
                    page = filter.Page, items = filter.Items, name = filter.Name, project = filter.Project,
                    status = filter.Status
                });
        }

        /// <summary>
        /// Gets a filtered and paginated list of LifeCycleManagers
        /// </summary>
        /// <param name="query">containing pagenumber, itemcount, name, project and status</param>
        /// <returns>DevicesListViewDataModel containing the devices, query and amount of pages</returns>
        private async Task<DevicesListViewModel> FilterDevices(DevicesFilter query)
        {
            if (query.Status.Equals("ALL"))
            {
                query.Status = "";
            }

            string httpResponse = await restService.PostRequest($"/api/devices", query);
            DevicesListViewModel response = ParseJSONResponse(httpResponse);
            response.Filter = query;
            return response;
        }

        /// <summary>
        /// Parses the JSON formatted string into a DevicesListViewModel
        /// </summary>
        /// <param name="httpResponse">JSON formatted string</param>
        /// <returns>Parsed DevicesListViewModel</returns>
        private DevicesListViewModel ParseJSONResponse(string httpResponse)
        {
            JObject jsonResponse = JObject.Parse(httpResponse);
            IList<JToken> jsonDevices = jsonResponse["devices"].Children().ToList();
            long amountOfPages = jsonResponse["numberOfPages"].ToObject<long>();
            List<LifeCycleManagerListView> devices = new List<LifeCycleManagerListView>();
            foreach (JToken token in jsonDevices)
            {
                devices.Add(token.ToObject<LifeCycleManagerListView>());
            }

            return new DevicesListViewModel(devices, amountOfPages);
        }
    }
}
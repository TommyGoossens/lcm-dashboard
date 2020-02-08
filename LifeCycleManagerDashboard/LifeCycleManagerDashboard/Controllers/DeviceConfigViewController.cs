using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LifeCycleManagerDashboard.Filters;
using LifeCycleManagerDashboard.Models.ViewModels;
using LifeCycleManagerDashboard.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Web;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NLog;

namespace LifeCycleManagerDashboard.Controllers
{
    [Authorize]
    [TypeFilter(typeof(NoConnectionExceptionFilter))]
    [TypeFilter(typeof(DeviceUnavailableExceptionFilter))]
    [Route("[controller]")]
    public class DeviceConfigViewController : Controller
    {
        private readonly IRestService restService;
        private static readonly Logger Logger = LogManager.GetCurrentClassLogger();

        public DeviceConfigViewController(IRestService restService)
        {
            this.restService = restService;
        }

        [HttpGet]
        [AuthorizeForScopes(ScopeKeySection = "Permissions:UserRead")]
        public async Task<ViewResult> Index(string deviceId)
        {
            ViewBag.DeviceId = deviceId;
            ViewData["AccessToken"] = restService.GetAccessToken().Result;
            return View("DeviceConfigView", await GetConfig(deviceId));
        }

        private async Task<DeviceConfigViewModel> GetConfig(string deviceId)
        {
            string receivedJson = await restService.GetRequest($"/api/configuration/{deviceId}");
            DeviceConfigViewModel model = new DeviceConfigViewModel();
            try
            {
                JToken parsedJson = JToken.Parse(receivedJson);
                foreach (JToken token in parsedJson)
                {
                    var property = (JProperty) token;
                    if (property.Name.Equals("Intervals"))
                    {
                        model.Intervals = JsonConvert.DeserializeObject<Dictionary<string, object>>(
                            parsedJson["Intervals"]
                                .ToString());
                        continue;
                    }

                    List<Dictionary<string, object>> childNodes = property.Children().Children()
                        .Select(node => node.ToObject<Dictionary<string, object>>()).ToList();

                    switch (property.Name)
                    {
                        case "IOControllers":
                            model.IOControllers = childNodes;
                            break;
                        case "PowerSupplies":
                            model.PowerSupplies = childNodes;
                            break;
                        case "Programs":
                            model.Programs = childNodes;
                            break;
                        default:
                            continue;
                    }
                }
            }
            catch (JsonReaderException e)
            {
                Logger.Error(e,$"Unable to parse the JSON string for device {deviceId}", receivedJson);
                throw;
            }

            return model;
        }
    }
}
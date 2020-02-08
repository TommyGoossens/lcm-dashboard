using System.Threading.Tasks;
using LifeCycleManagerDashboard.Filters;
using LifeCycleManagerDashboard.Models.ViewModels;
using LifeCycleManagerDashboard.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Web;
using Newtonsoft.Json;

namespace LifeCycleManagerDashboard.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [TypeFilter(typeof(EntityNotFoundExceptionFilter))]
    public class DeviceDetailViewController : Controller
    {
        private readonly IRestService restService;

        public DeviceDetailViewController(IRestService restService)
        {
            this.restService = restService;
        }

        [AuthorizeForScopes(ScopeKeySection = "Permissions:UserRead")]
        [HttpGet]
        public IActionResult Device(string deviceId)
        {
            ViewBag.DeviceId = deviceId;
            ViewData["AccessToken"] = restService.GetAccessToken().Result;
            return View("DeviceDetailView", GetDeviceDetails(deviceId).Result);
        }

        private async Task<DeviceDetailViewDataModel> GetDeviceDetails(string deviceId)
        {
            string jsonResponse = await restService.GetRequest($"/api/devices/{deviceId}/details");
            DeviceDetailViewDataModel parsedResponse =
                JsonConvert.DeserializeObject<DeviceDetailViewDataModel>(jsonResponse);

            return parsedResponse;
        }
    }
}
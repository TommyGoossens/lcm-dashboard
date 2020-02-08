using System.Collections.Generic;
using System.Threading.Tasks;
using LifeCycleManagerDashboard.Filters;
using LifeCycleManagerDashboard.Models;
using LifeCycleManagerDashboard.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Web;
using Newtonsoft.Json;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace LifeCycleManagerDashboard.Controllers
{
    [Authorize]
    [TypeFilter(typeof(NoConnectionExceptionFilter))]
    [Route("[controller]")]
    public class ProjectListViewController : Controller
    {
        private readonly IRestService restService;

        public ProjectListViewController(IRestService restService)
        {
            this.restService = restService;
        }

        // GET: /<controller>/
        /// <summary>
        /// Retrieves all projects from the database and displays the corresponding view
        /// </summary>
        /// <returns>A view containing a list of Projects</returns>
        [HttpGet("")]
        [AuthorizeForScopes(ScopeKeySection = "Permissions:UserRead")]
        public IActionResult Index()
        {
            ViewData["AccessToken"] = restService.GetAccessToken().Result;
            return View("ProjectListView", GetProjects().Result);
        }

        private async Task<List<Project>> GetProjects()
        {
            string httpResponse = await restService.GetRequest("/api/projects");
            return JsonConvert.DeserializeObject<List<Project>>(httpResponse);
        }
    }
}
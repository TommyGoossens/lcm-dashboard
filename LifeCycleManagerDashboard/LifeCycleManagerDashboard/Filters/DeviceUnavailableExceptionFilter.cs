using System.Collections.Specialized;
using System.Diagnostics;
using System.Net.Http;
using System.Web;
using LifeCycleManagerDashboard.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ViewFeatures;

namespace LifeCycleManagerDashboard.Filters
{
    public class DeviceUnavailableExceptionFilter : ExceptionFilterAttribute
    {
        private readonly IModelMetadataProvider modelMetadataProvider;

        public DeviceUnavailableExceptionFilter(IModelMetadataProvider modelMetadataProvider)
        {
            this.modelMetadataProvider = modelMetadataProvider;
        }

        public override void OnException(ExceptionContext context)
        {
            if (!context.ExceptionHandled && context.Exception is HttpRequestException &&
                context.Exception.Message.Contains("503"))
            {
                context.ExceptionHandled = true;

                ViewResult result = new ViewResult {ViewName = "Error"};
                string requestQuery = context.HttpContext.Request.QueryString.Value;
                NameValueCollection parsedQuery = HttpUtility.ParseQueryString(requestQuery);
                string deviceName = parsedQuery.Get("DeviceId");

                result.ViewData = new ViewDataDictionary(modelMetadataProvider, context.ModelState)
                {
                    {"Exception", "The requested device is currently unavailable"},
                    {
                        "Body",
                        $"The requested entity: {deviceName ?? requestQuery} is currently offline."
                    }
                };

                result.ViewData.Model = new ErrorViewModel {RequestId = Activity.Current?.Id ?? ""};
                context.Result = result;
            }
        }
    }
}
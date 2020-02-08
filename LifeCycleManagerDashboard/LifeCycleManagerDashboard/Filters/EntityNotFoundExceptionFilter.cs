using System.Collections.Specialized;
using System.Diagnostics;
using System.Web;
using LifeCycleManagerDashboard.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ViewFeatures;

namespace LifeCycleManagerDashboard.Filters
{
    public class EntityNotFoundExceptionFilter : ExceptionFilterAttribute
    {
        private readonly IModelMetadataProvider modelMetadataProvider;

        public EntityNotFoundExceptionFilter(IModelMetadataProvider modelMetadataProvider)
        {
            this.modelMetadataProvider = modelMetadataProvider;
        }

        public override void OnException(ExceptionContext context)
        {
            if (!context.ExceptionHandled && context.Exception.Message.Contains("404"))
            {
                context.ExceptionHandled = true;

                ViewResult result = new ViewResult {ViewName = "Error"};
                string requestQuery = context.HttpContext.Request.QueryString.Value;
                NameValueCollection parsedQuery = HttpUtility.ParseQueryString(requestQuery);
                string deviceName = parsedQuery.Get("DeviceId");

                result.ViewData = new ViewDataDictionary(modelMetadataProvider, context.ModelState)
                {
                    {"Exception", "The requested entity was not found"},
                    {
                        "Body",
                        $"The requested entity: {deviceName ?? requestQuery} on path {context.HttpContext.Request.Path} was not found"
                    }
                };

                result.ViewData.Model = new ErrorViewModel {RequestId = Activity.Current?.Id ?? ""};
                context.Result = result;
            }
        }
    }
}
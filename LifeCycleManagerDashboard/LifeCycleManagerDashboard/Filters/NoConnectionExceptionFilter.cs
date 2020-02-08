using System;
using System.Net.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using LifeCycleManagerDashboard.Models;
using System.Diagnostics;
using System.Net.Sockets;

namespace LifeCycleManagerDashboard.Filters
{
    public class NoConnectionExceptionFilter : ExceptionFilterAttribute
    {
        private readonly IModelMetadataProvider _modelMetadataProvider;

        public NoConnectionExceptionFilter(IModelMetadataProvider modelMetadataProvider)
        {
            _modelMetadataProvider = modelMetadataProvider;
        }

        public override void OnException(ExceptionContext context)
        {
            if (!context.ExceptionHandled && context.Exception is AggregateException)
            {
                context.ExceptionHandled = true;

                // Sets the redirect options. Redirects to the View: Error.
                // Passes viewdata and a model to the view. If there is an activity ID it will be displayed as well.
                ViewResult result = new ViewResult { ViewName = "Error" };
                result.ViewData = new ViewDataDictionary(_modelMetadataProvider,
                                                            context.ModelState)
                {   {"Exception", "Server connection timeout"},
                    { "Body", "Unfortunately, the application was unable to connect to the server, please try again later." }
                };

                result.ViewData.Model = new ErrorViewModel { RequestId = Activity.Current?.Id ?? "" };
                context.Result = result;
            }
        }
    }
}
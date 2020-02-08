using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using LifeCycleManagerDashboard.Filters;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Routing;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using Microsoft.VisualStudio.TestPlatform.PlatformAbstractions;
using Xunit;

namespace Test_LifeCycleManagerDashboard
{
    public class ExceptionFilterTest
    {
        private static readonly ActionContext ActionContext = new ActionContext
        {
            HttpContext = new DefaultHttpContext(),
            RouteData = new RouteData(),
            ActionDescriptor = new ActionDescriptor()
        };

        private readonly ExceptionContext deviceUnavailableExceptionContext =
            new ExceptionContext(ActionContext, new List<IFilterMetadata>())
            {
                ExceptionHandled = false
            };

        private ExceptionContext entityNotFoundExceptionContext =
            new ExceptionContext(ActionContext, new List<IFilterMetadata>())
            {
                ExceptionHandled = false
            };

        private ExceptionContext noConnectionExceptionContext =
            new ExceptionContext(ActionContext, new List<IFilterMetadata>())
            {
                ExceptionHandled = false
            };

        [Fact]
        public void DeviceUnavailableTest()
        {
            DeviceUnavailableExceptionFilter filter =
                new DeviceUnavailableExceptionFilter(new EmptyModelMetadataProvider());
            try
            {
                throw new HttpRequestException("503 (Service Unavailable)");
            }
            catch (Exception e)
            {
                deviceUnavailableExceptionContext.Exception = e;
                filter.OnException(deviceUnavailableExceptionContext);
                ViewResult result = (ViewResult) deviceUnavailableExceptionContext.Result;
                Assert.Equal("The requested entity:  is currently offline.", result.ViewData.Values.Last());
                Assert.True(deviceUnavailableExceptionContext.ExceptionHandled);
            }
        }

        [Fact]
        public void DeviceUnavailableWrongExceptionTest()
        {
            DeviceUnavailableExceptionFilter filter =
                new DeviceUnavailableExceptionFilter(new EmptyModelMetadataProvider());
            try
            {
                throw new ThreadApartmentStateNotSupportedException();
            }
            catch (Exception e)
            {
                deviceUnavailableExceptionContext.Exception = e;
                filter.OnException(deviceUnavailableExceptionContext);
                Assert.False(deviceUnavailableExceptionContext.ExceptionHandled);
            }
        }

        [Fact]
        public void EntityNotFoundTest()
        {
            EntityNotFoundExceptionFilter filter =
                new EntityNotFoundExceptionFilter(new EmptyModelMetadataProvider());
            try
            {
                throw new HttpRequestException("404 (not found)");
            }
            catch (Exception e)
            {
                entityNotFoundExceptionContext.Exception = e;
                filter.OnException(entityNotFoundExceptionContext);
                ViewResult result = (ViewResult) entityNotFoundExceptionContext.Result;
                Assert.Equal("The requested entity was not found", result.ViewData.Values.First());
                Assert.True(entityNotFoundExceptionContext.ExceptionHandled);
            }
        }

        [Fact]
        public void EntityNotFoundWrongExceptionTest()
        {
            EntityNotFoundExceptionFilter filter =
                new EntityNotFoundExceptionFilter(new EmptyModelMetadataProvider());
            try
            {
                throw new OpenIdConnectProtocolInvalidCHashException("Whoops");
            }
            catch (Exception e)
            {
                entityNotFoundExceptionContext.Exception = e;
                filter.OnException(entityNotFoundExceptionContext);
                Assert.False(entityNotFoundExceptionContext.ExceptionHandled);
            }
        }

        [Fact]
        public void NoConnectionTest()
        {
            NoConnectionExceptionFilter filter =
                new NoConnectionExceptionFilter(new EmptyModelMetadataProvider());
            try

            {
                throw new AggregateException();
            }
            catch (Exception e)
            {
                noConnectionExceptionContext.Exception = e;
                filter.OnException(noConnectionExceptionContext);
                ViewResult result = (ViewResult) noConnectionExceptionContext.Result;
                Assert.Equal(
                    "Unfortunately, the application was unable to connect to the server, please try again later.",
                    result.ViewData.Values.Last());
                Assert.True(noConnectionExceptionContext.ExceptionHandled);
            }
        }

        [Fact]
        public void NoConnectionWrongExceptionTest()
        {
            NoConnectionExceptionFilter filter =
                new NoConnectionExceptionFilter(new EmptyModelMetadataProvider());
            try

            {
                throw new SecurityTokenEncryptionKeyNotFoundException();
            }
            catch (Exception e)
            {
                noConnectionExceptionContext.Exception = e;
                filter.OnException(noConnectionExceptionContext);
                Assert.False(noConnectionExceptionContext.ExceptionHandled);
            }
        }
    }
}
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using LifeCycleManagerDashboard.Controllers;
using LifeCycleManagerDashboard.Models.Filters;
using LifeCycleManagerDashboard.Models.LifeCycleManager;
using LifeCycleManagerDashboard.Models.ViewModels;
using LifeCycleManagerDashboard.Properties;
using LifeCycleManagerDashboard.Services;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Test_LifeCycleManagerDashboard.Helpers;
using Test_LifeCycleManagerDashboard.Mocks;
using Xunit;

namespace Test_LifeCycleManagerDashboard
{
    public class DevicesListViewTest
    {
        private readonly MockConfiguration mockConfiguration = new MockConfiguration();
        private readonly MockTokenAcquisition mockTokenAcquisition = new MockTokenAcquisition();

        private static readonly List<LifeCycleManagerListView> Devices = new List<LifeCycleManagerListView>()
        {
            new LifeCycleManagerListView("Connected", "Running", "device1", "testProject", "Datalab", DateTime.Now,
                "1.0.0"),
            new LifeCycleManagerListView("Connected", "Running", "device2", "testProject", "Datalab", DateTime.Now,
                "1.0.0"),
            new LifeCycleManagerListView("Connected", "Running", "device3", "testProject", "Datalab", DateTime.Now,
                "1.0.0"),
            new LifeCycleManagerListView("Connected", "Running", "device4", "testProject", "Datalab", DateTime.Now,
                "1.0.0"),
            new LifeCycleManagerListView("Connected", "Running", "device5", "testProject", "Datalab", DateTime.Now,
                "1.0.0"),
        };

        private readonly FakeResponseHandler fakeDevicesHandler = new FakeResponseHandler();
        private readonly RestService fakeDataRestService;

        public DevicesListViewTest()
        {
            ApplicationURLS.SetURLS("https://localhost", "https://localhost");

            string data = JsonConvert.SerializeObject(new DevicesListViewModel(Devices, 1), SerializerSettings.Json);
            fakeDevicesHandler.AddFakeResponse(
                new Uri($"{ApplicationURLS.Backend}/api/devices"),
                new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StringContent(data)
                });

            fakeDataRestService = new RestService(new HttpClient(fakeDevicesHandler), mockTokenAcquisition,
                mockConfiguration);
        }

        [Fact]
        public void PassPageNumberAndItemsPerPageToView()
        {
            DevicesListViewController devicesListViewController = new DevicesListViewController(fakeDataRestService);

            ViewResult viewResult = (ViewResult) devicesListViewController.Index(1, 25);
            Assert.Equal(1, viewResult.ViewData["PageNumber"]);
            Assert.Equal(25, viewResult.ViewData["ItemsPerPage"]);
        }

        [Fact]
        public void ItemCountPageNumberZeroTest()
        {
            DevicesListViewController devicesListViewController = new DevicesListViewController(fakeDataRestService);
            ViewResult viewResult = (ViewResult) devicesListViewController.Index(0, 0);
            Assert.Equal(1, viewResult.ViewData["PageNumber"]);
            Assert.Equal(25, viewResult.ViewData["ItemsPerPage"]);
        }

        [Fact]
        public void EmptyProjectFilter()
        {
            DevicesListViewController devicesListViewController = new DevicesListViewController(fakeDataRestService);
            DevicesFilter nullFilter = new DevicesFilter();

            nullFilter.Project = null;
            nullFilter.Name = null;
            nullFilter.Status = "ALL";
            Assert.Null(nullFilter.Project);
            Assert.Null(nullFilter.Name);
            RedirectToActionResult redirectResult =
                (RedirectToActionResult) devicesListViewController.Filter(nullFilter);
            Assert.NotNull(redirectResult);

            Assert.Equal(1, redirectResult.RouteValues["page"]);
            Assert.Equal(25, redirectResult.RouteValues["items"]);
            Assert.Equal("", redirectResult.RouteValues["name"]);
            Assert.Equal("", redirectResult.RouteValues["project"]);
            Assert.Equal("ALL", redirectResult.RouteValues["status"]);
        }


        [Fact]
        public void ExceptionWithoutConnection()
        {
            FakeResponseHandler noConnectionHandler = new FakeResponseHandler();
            noConnectionHandler.AddFakeException(
                new Uri($"{ApplicationURLS.Backend}/api/devices/page=1&items=25"),
                new AggregateException());
            RestService restService = new RestService(new HttpClient(noConnectionHandler), mockTokenAcquisition,
                mockConfiguration);
            DevicesListViewController devicesListViewController = new DevicesListViewController(restService);

            Assert.Throws<AggregateException>(() => devicesListViewController.Index(1, 25));
        }
    }
}
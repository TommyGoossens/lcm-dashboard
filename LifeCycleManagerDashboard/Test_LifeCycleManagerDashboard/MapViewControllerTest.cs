using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using LifeCycleManagerDashboard.Controllers;
using LifeCycleManagerDashboard.Models;
using LifeCycleManagerDashboard.Models.LifeCycleManager;
using LifeCycleManagerDashboard.Models.ViewModels;
using LifeCycleManagerDashboard.Properties;
using LifeCycleManagerDashboard.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Test_LifeCycleManagerDashboard.Helpers;
using Test_LifeCycleManagerDashboard.Mocks;
using Xunit;

namespace Test_LifeCycleManagerDashboard
{
    public class MapViewControllerTest
    {
        private readonly MockConfiguration mockConfiguration = new MockConfiguration();
        private readonly MockTokenAcquisition mockTokenAcquisition = new MockTokenAcquisition();
        private readonly FakeResponseHandler fakeDevicesHandler = new FakeResponseHandler();

        private readonly List<LifeCycleManagerMapView> devices = new List<LifeCycleManagerMapView>()
        {
            new LifeCycleManagerMapView("Connected", "device1", "testProject", 0.00, 0.00, "INFO", "DataLab",
                new DeviceAddress()),
            new LifeCycleManagerMapView("Connected", "device2", "testProject", 0.00, 0.00, "INFO", "DataLab",
                new DeviceAddress()),
            new LifeCycleManagerMapView("Disconnected", "device3", "testProject", 0.00, 0.00, "INFO", "DataLab",
                new DeviceAddress())
        };

        public MapViewControllerTest()
        {
            ApplicationURLS.SetURLS("https://localhost", "https://localhost");

            fakeDevicesHandler.AddFakeResponse(
                new Uri($"{ApplicationURLS.Backend}/api/devices"),
                new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StringContent(JsonConvert.SerializeObject(devices))
                });
            fakeDevicesHandler.AddFakeResponse(
                new Uri($"{ApplicationURLS.Backend}/api/projects"),
                new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StringContent(JsonConvert.SerializeObject(new List<Project>()))
                });
        }

        [Fact]
        public void RetrieveDevicesFromBackend()
        {
            RestService restService = new RestService(new HttpClient(fakeDevicesHandler), mockTokenAcquisition,
                mockConfiguration);
            MapViewController mapViewController = new MapViewController(restService);

            ViewResult result = (ViewResult) mapViewController.Index().Result;
            MapViewModel resultWrapper = (MapViewModel) result.Model;

            Assert.Equal(2, resultWrapper.LifeCycleManagers.Count(l => l.ConnectionState.Equals("Connected")));
            Assert.Single(resultWrapper.LifeCycleManagers.Where(l => l.ConnectionState.Equals("Disconnected")));
        }

        [Fact]
        public void SetSelectedDevice()
        {
            RestService restService = new RestService(new HttpClient(fakeDevicesHandler), mockTokenAcquisition,
                mockConfiguration);
            MapViewController mapViewController = new MapViewController(restService);

            ViewResult result = (ViewResult) mapViewController.Device("device1").Result;
            MapViewModel resultWrapper = (MapViewModel) result.Model;

            Assert.Equal(2, resultWrapper.LifeCycleManagers.Count(l => l.ConnectionState.Equals("Connected")));
            Assert.Equal("device1", resultWrapper.SelectedDevice.DeviceId);
        }

        [Fact]
        public void ExceptionWithoutConnection()
        {
            FakeResponseHandler noConnectionHandler = new FakeResponseHandler();
            noConnectionHandler.AddFakeException(
                new Uri($"{ApplicationURLS.Backend}/api/devices"),
                new AggregateException());

            RestService restService = new RestService(new HttpClient(noConnectionHandler), mockTokenAcquisition,
                mockConfiguration);

            MapViewController mapViewController = new MapViewController(restService)
            {
                ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext()}
            };
            Assert.ThrowsAsync<AggregateException>(() => mapViewController.Index());
        }
    }
}
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using LifeCycleManagerDashboard.Controllers;
using LifeCycleManagerDashboard.Models.LifeCycleManager;
using LifeCycleManagerDashboard.Models.LogMessages;
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
    public class DevicesDetailViewTest
    {
        private readonly MockConfiguration mockConfiguration = new MockConfiguration();
        private readonly MockTokenAcquisition mockTokenAcquisition = new MockTokenAcquisition();

        private static readonly LifeCycleManagerDetailView Device = new LifeCycleManagerDetailView(0.00, 0.00,
            "Disconnected", "WARNING", "device1", "Project1", "DataLab", DateTime.Now, "1.0.0");

        private static readonly LifeCycleManagerStatistics Stats = new LifeCycleManagerStatistics()
        {
            ApplicationName = "App",
            Uptime = "100h",
            DiskUsage = "50%",
            CpuUsage = "50%",
            RamUsage = "50%"
        };

        private static readonly DeviceDetailViewDataModel MockDataModel =
            new DeviceDetailViewDataModel(Device, Stats, new List<string>(), new List<LCMLoggingMessage>
            {
                new LCMLoggingMessage
                {
                    Message = "Mock log message",
                    LoggingLevel = "INFO"
                }
            });

        public DevicesDetailViewTest()
        {
            ApplicationURLS.SetURLS("https://localhost", "https://localhost");
        }

        [Fact]
        public void GetDeviceDetails()
        {
            string data = JsonConvert.SerializeObject(MockDataModel);
            FakeResponseHandler fakeDevicesHandler = new FakeResponseHandler();
            fakeDevicesHandler.AddFakeResponse(
                new Uri($"{ApplicationURLS.Backend}/api/devices/{MockDataModel.Device.DeviceId}/details"),
                new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StringContent(data)
                });
            RestService restService = new RestService(new HttpClient(fakeDevicesHandler), mockTokenAcquisition,
                mockConfiguration);
            
            DeviceDetailViewController deviceDetailViewController = new DeviceDetailViewController(restService);
            ViewResult viewResult = deviceDetailViewController.Device("device1") as ViewResult;

            Assert.Equal("device1", viewResult.ViewData["DeviceID"]);
        }

        [Fact]
        public void NotExistingDevice()
        {
            FakeResponseHandler fakeNotExistingDeviceHandler = new FakeResponseHandler();
            fakeNotExistingDeviceHandler.AddFakeException(
                new Uri($"{ApplicationURLS.Backend}/api/devices/{MockDataModel.Device.DeviceId}/details"),
                new HttpRequestException($"Device {MockDataModel.Device.DeviceId} not found")
            );
            RestService restService = new RestService(new HttpClient(fakeNotExistingDeviceHandler),
                mockTokenAcquisition, mockConfiguration);
            DeviceDetailViewController deviceDetailViewController = new DeviceDetailViewController(restService);
            try
            {
                deviceDetailViewController.Device(MockDataModel.Device.DeviceId);
            }
            catch (Exception e)
            {
                Assert.IsType<HttpRequestException>(e.InnerException);
                Assert.Equal("Response status code does not indicate success: 404 (Not Found).",
                    e.InnerException.Message);
            }
        }
    }
}
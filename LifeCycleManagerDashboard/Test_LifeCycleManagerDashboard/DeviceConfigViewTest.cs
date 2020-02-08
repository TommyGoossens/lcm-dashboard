using System;
using System.Net;
using System.Net.Http;
using LifeCycleManagerDashboard.Controllers;
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
    public class DeviceConfigViewTest
    {
        private readonly MockConfiguration mockConfiguration = new MockConfiguration();
        private readonly MockTokenAcquisition mockTokenAcquisition = new MockTokenAcquisition();

        private string mockJsonData =
            @"{""Intervals"":{""ControlInterval"":1,""MonitorInterval"":5,""SendInterval"":10},""NumberOfIOControllers"":0,""IOControllers"":[],""NumberOfPowerSupplies"":0,""PowerSupplies"":[],""NumberOfProgramsToMonitor"":1,""Programs"":[{""ProgramName"":""ATMS"",""ProgramPath"":""\/usr\/src\/ATMS\/ATMS\/build\/mainapp\/mainapp"",""SocketPath"":""\/usr\/src\/pipeTest"",""StartUpTime"":15, ""test"":true}]}";

        private string mockIncompleteJsonData =
            @"{""Intervals"":{""ControlInterval"":1,""MonitorInterval"":5,""SendInterval"":10},""NumberOfIOControllers"":0,""IOControllers"":[],""NumberOfPowerSupplies"":0,""PowerSupplies"":[],""NumberOfProgramsToMonitor"":1,""Programs"":[{""ProgramName"":""ATMS"",""ProgramPath"":""\/usr\/src\/ATMS\/ATMS\/build\/mainapp\/mainapp"",""SocketPath"":""\/usr\/";

        public DeviceConfigViewTest()
        {
            ApplicationURLS.SetURLS("https://localhost", "https://localhost");
        }

        [Fact]
        public async void LoadConfigTest()
        {
            FakeResponseHandler fakeConfig = new FakeResponseHandler();
            fakeConfig.AddFakeResponse(
                new Uri($"{ApplicationURLS.Backend}/api/configuration/TestingDevice"),
                new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StringContent(mockJsonData)
                });
            RestService restService = new RestService(new HttpClient(fakeConfig), mockTokenAcquisition,
                mockConfiguration);
            DeviceConfigViewController deviceDetailViewController = new DeviceConfigViewController(restService);
            ViewResult viewResult = await deviceDetailViewController.Index("TestingDevice");
            DeviceConfigViewModel model = viewResult.Model as DeviceConfigViewModel;
            Assert.NotNull(model);
            Assert.Equal(1, model.NumberOfPrograms);
            Assert.Single(model.Programs);
            Assert.Equal("TestingDevice", viewResult.ViewData["DeviceID"]);
        }

        [Fact]
        public async void IncompleteJsonTest()
        {
            FakeResponseHandler fakeConfig = new FakeResponseHandler();
            fakeConfig.AddFakeResponse(
                new Uri($"{ApplicationURLS.Backend}/api/configuration/TestingDevice"),
                new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StringContent(mockIncompleteJsonData)
                });
            RestService restService = new RestService(new HttpClient(fakeConfig), mockTokenAcquisition,
                mockConfiguration);
            DeviceConfigViewController deviceDetailViewController = new DeviceConfigViewController(restService);
            try
            {
                await deviceDetailViewController.Index("TestingDevice");
            }
            catch (Exception e)
            {
                Assert.IsType<JsonReaderException>(e);
            }
        }
    }
}
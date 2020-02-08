using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using LifeCycleManagerDashboard.Controllers;
using LifeCycleManagerDashboard.Models;
using LifeCycleManagerDashboard.Properties;
using LifeCycleManagerDashboard.Services;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Test_LifeCycleManagerDashboard.Helpers;
using Test_LifeCycleManagerDashboard.Mocks;
using Xunit;

namespace Test_LifeCycleManagerDashboard
{
    public class ProjectListViewTest
    {
        private readonly MockConfiguration mockConfiguration = new MockConfiguration();
        private readonly MockTokenAcquisition mockTokenAcquisition = new MockTokenAcquisition();

        private readonly List<Project> mockProjects = new List<Project>
        {
            new Project
            {
                ContactPerson = new ContactPerson("User", "user@heijmans.nl", "+31612345678"),
                Description = "Mock project description",
                Name = "Mock Project",
                ProjectId = 1
            },
            new Project
            {
                ContactPerson = new ContactPerson("User", "user@heijmans.nl", "+31612345678"),
                Description = "Mock project 2 description",
                Name = "Mock Project 2",
                ProjectId = 2
            }
        };

        public ProjectListViewTest()
        {
            ApplicationURLS.SetURLS("https://localhost", "https://localhost");
        }

        [Fact]
        public void GetProjects()
        {
            string data = JsonConvert.SerializeObject(mockProjects);
            FakeResponseHandler fakeDevicesHandler = new FakeResponseHandler();
            fakeDevicesHandler.AddFakeResponse(
                new Uri($"{ApplicationURLS.Backend}/api/projects"),
                new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StringContent(data)
                });
            RestService restService = new RestService(new HttpClient(fakeDevicesHandler), mockTokenAcquisition,
                mockConfiguration);
            ProjectListViewController projectListViewController = new ProjectListViewController(restService);
            ViewResult viewResult = projectListViewController.Index() as ViewResult;

            Assert.NotNull(viewResult);
            List<Project> viewModelProjects = viewResult.Model as List<Project>;

            Assert.NotNull(viewModelProjects);
            Assert.Equal(2, viewModelProjects.Count);
            Assert.Equal(MockConstants.MockAccessToken, viewResult.ViewData["AccessToken"]);
        }
    }
}
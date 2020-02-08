using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using LifeCycleManagerDashboard.Filters;
using LifeCycleManagerDashboard.Properties;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Identity.Web;
using Newtonsoft.Json;
using NLog;

namespace LifeCycleManagerDashboard.Services
{
    public static class RestServiceExtensions
    {
        public static void AddRestService(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddHttpClient<IRestService, RestService>();
        }
    }

    [TypeFilter(typeof(NoConnectionExceptionFilter))]
    public class RestService : IRestService
    {
        private readonly HttpClient httpClient;
        private readonly ITokenAcquisition tokenAcquisition;
        private readonly string backendScope;
        private static readonly Logger Logger = LogManager.GetCurrentClassLogger();


        public RestService(HttpClient httpClient, ITokenAcquisition tokenAcquisition, IConfiguration configuration)
        {
            this.httpClient = httpClient;
            this.tokenAcquisition = tokenAcquisition;
            backendScope = configuration["Permissions:UserRead"];
        }

        /// <summary>
        /// Executing get request on specified endpoint
        /// </summary>
        /// <param name="endpoint">Endpoint to which the request will be made.</param>
        /// <returns>JSON string or an exception.</returns>
        public async Task<string> GetRequest(string endpoint)
        {
            Logger.Info($"Sending GET request to {ApplicationURLS.Backend}{endpoint}");
            await PrepareAuthenticatedClient();
            try
            {
                using HttpResponseMessage response = await httpClient.GetAsync(ApplicationURLS.Backend + endpoint);
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadAsStringAsync();
            }
            // When there is no connection
            catch (Exception e)
            {
                Logger.Error(e, $"Error while executing GET request to {ApplicationURLS.Backend}{endpoint}");
                if (e is HttpRequestException || e is AggregateException)
                {
                    // NoConnectionExceptionFilter will catch the exception
                    throw;
                }

                return null;
            }
        }

        /// <summary>
        /// Sends a post request to the API
        /// </summary>
        /// <param name="endpoint">Endpoint for the controller</param>
        /// <param name="body">Object send as body. Gets serialized by the RestService</param>
        /// <returns>JSON response</returns>
        public async Task<string> PostRequest(string endpoint, Object body)
        {
            Logger.Info($"Sending POST request to {ApplicationURLS.Backend}{endpoint}");
            await PrepareAuthenticatedClient();
            try
            {
                HttpContent content = new StringContent(JsonConvert.SerializeObject(body));
                using HttpResponseMessage response =
                    await httpClient.PostAsync(ApplicationURLS.Backend + endpoint, content);
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadAsStringAsync();
            }
            catch (Exception e)
            {
                Logger.Fatal(e, $"Error while executing POST request to {ApplicationURLS.Backend}{endpoint}");
                if (e is HttpRequestException || e is AggregateException)
                {
                    throw;
                }

                return null;
            }
        }

        /// <summary>
        /// Gets a new access token on behalf of the user
        /// </summary>
        /// <returns>JWT in string format</returns>
        public async Task<string> GetAccessToken()
        {
            return await tokenAcquisition.GetAccessTokenOnBehalfOfUserAsync(new[] {this.backendScope});
        }

        private async Task PrepareAuthenticatedClient()
        {
            string accessToken =
                await this.tokenAcquisition.GetAccessTokenOnBehalfOfUserAsync(new[] {this.backendScope});
            this.httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", accessToken);
            this.httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }
    }
}
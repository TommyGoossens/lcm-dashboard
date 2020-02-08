using System;
using System.Threading.Tasks;

namespace LifeCycleManagerDashboard.Services
{
    public interface IRestService
    {
        /// <summary>
        /// Executing get request on specified endpoint
        /// </summary>
        /// <param name="endpoint">Endpoint to which the request will be made.</param>
        /// <returns>JSON string or an exception.</returns>
        Task<string> GetRequest(string endpoint);

        /// <summary>
        /// Sends a post request to the API
        /// </summary>
        /// <param name="endpoint">Endpoint for the controller</param>
        /// <param name="body">Object send as body. Gets serialized by the RestService</param>
        /// <returns>JSON response</returns>
        Task<string> PostRequest(string endpoint, Object body);

        /// <summary>
        /// Gets a new access token on behalf of the user
        /// </summary>
        /// <returns>JWT in string format</returns>
        Task<string> GetAccessToken();
    }
}
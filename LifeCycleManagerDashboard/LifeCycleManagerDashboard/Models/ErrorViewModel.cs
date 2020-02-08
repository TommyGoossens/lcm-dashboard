namespace LifeCycleManagerDashboard.Models
{
    public class ErrorViewModel
    {
        public string RequestId { get; set; }

        /// <summary>
        /// A boolean that sets the visibility of the request id in the Error view.
        /// </summary>
        public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
    }
}
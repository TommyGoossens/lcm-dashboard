namespace LifeCycleManagerDashboard.Models.LifeCycleManager
{
    public abstract class LifeCycleManagerBase
    {
        public string ConnectionState { get; private set; }

        public string DeviceId { get; private set; }

        public string Project { get; private set; }
        public string ApplicationState { get; private set; }
        public string Location { get; private set; }

        protected LifeCycleManagerBase(string connectionState, string deviceId, string projectId, string applicationState,
            string location)
        {
            this.ConnectionState = connectionState;
            this.DeviceId = deviceId;
            this.Project = projectId;
            this.ApplicationState = applicationState;
            this.Location = location;
        }
    }
}
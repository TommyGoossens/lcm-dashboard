namespace LifeCycleManagerDashboard.Properties
{
    public static class ApplicationURLS
    {
        public static string Backend { get; private set; }
        public static string WebApp { get; private set; }

        public static void SetURLS(string backend, string webApp)
        {
            Backend = backend;
            WebApp = webApp;
        }
    }
}
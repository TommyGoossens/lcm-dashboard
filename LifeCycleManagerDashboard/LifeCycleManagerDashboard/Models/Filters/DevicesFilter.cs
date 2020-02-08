namespace LifeCycleManagerDashboard.Models.Filters
{
    public class DevicesFilter
    {
        public int Page { get; set; } = 1;

        public int Items { get; set; } = 25;

        public string Name { get; set; } = "";

        public string Project { get; set; } = "";

        public string Status { get; set; } = "";

        public DevicesFilter(int page, int items, string name, string project, string status)
        {
            this.Page = page;
            this.Items = items;
            this.Name = name;
            this.Project = project;
            this.Status = status;
        }

        public DevicesFilter()
        {
        }
    }
}
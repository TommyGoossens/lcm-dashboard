using System.Collections.Generic;

namespace LifeCycleManagerDashboard.Properties
{
    public static class Constants
    {
        public static readonly List<string> Provinces = new List<string>
        {
            "Drenthe",
            "Flevoland",
            "Friesland",
            "Gelderland",
            "Groningen",
            "Limburg",
            "Noord-Brabant",
            "Noord-Holland",
            "Overijssel",
            "Utrecht",
            "Zeeland",
            "Zuid-Holland"
        };

        public static readonly List<string> DeviceStatuses = new List<string>
        {
            "Running",
            "Disconnected",
            "Fatal",
            "Error",
            "Warning"
        };
    }
}
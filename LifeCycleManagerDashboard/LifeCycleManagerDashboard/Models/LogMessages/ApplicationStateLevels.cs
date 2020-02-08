using System;
using System.Collections.Generic;
using System.Linq;

namespace LifeCycleManagerDashboard.Models.LogMessages
{
    public static class ApplicationStateLevels
    {
        public enum ApplicationStateLevel
        {
            INFO,
            DEBUG,
            WARNING,
            ERROR,
            FATAL
        }

        public static List<string> GetApplicationStateLevels()
        {
            return Enum.GetNames(typeof(ApplicationStateLevel)).ToList();
        }
    }
}
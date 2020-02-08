using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LifeCycleManagerDashboard.Models.LogMessages
{
    public enum LCMLoggingLevel
    {
        INFO,
        DEBUG,
        WARNING,
        ERROR,
        FATAL
    }

    public class LCMLoggingMessage : LCMMessage
    {
        private string loggingLevel;

        public string LoggingLevel
        {
            get { return loggingLevel; }
            set
            {
                loggingLevel = Enum.TryParse(value, out LCMLoggingLevel LcmLoggingLevel) ? value : null;
            }
        }

        public string Message { get; set; }
    }
}
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Primitives;

namespace Test_LifeCycleManagerDashboard.Mocks
{
    public class MockConfiguration : IConfiguration
    {
        private Dictionary<string, string> keys = new Dictionary<string, string>();

        public MockConfiguration()
        {
            keys["Permissions"] = "UserRead";
        }

        public IEnumerable<IConfigurationSection> GetChildren()
        {
            throw new System.NotImplementedException();
        }

        public IChangeToken GetReloadToken()
        {
            throw new System.NotImplementedException();
        }

        public IConfigurationSection GetSection(string key)
        {
            throw new System.NotImplementedException();
        }

        public string this[string key]
        {
            get => key;
            set => throw new System.NotImplementedException();
        }
    }
}
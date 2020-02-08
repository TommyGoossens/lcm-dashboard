using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Test_LifeCycleManagerDashboard.Helpers
{
    public class SerializerSettings
    {
        public static JsonSerializerSettings Json = new JsonSerializerSettings
        {
            ContractResolver = new DefaultContractResolver
            {
                NamingStrategy = new CamelCaseNamingStrategy()
            }
        };
    }
}
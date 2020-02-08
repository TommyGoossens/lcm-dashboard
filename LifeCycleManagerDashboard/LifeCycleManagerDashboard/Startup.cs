using System.IO;
using LifeCycleManagerDashboard.Properties;
using LifeCycleManagerDashboard.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Identity.Web;
using Microsoft.Identity.Web.TokenCacheProviders.InMemory;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;
using NLog;

namespace LifeCycleManagerDashboard
{
    public class Startup
    {
        private static readonly Logger Logger = LogManager.GetCurrentClassLogger();

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDistributedMemoryCache();

            services.AddOptions();

            services.AddMicrosoftIdentityPlatformAuthentication(Configuration)
                .AddMsal(Configuration, new string[] {Configuration["Permissions:UserRead"]})
                .AddInMemoryTokenCaches();

            services.AddControllersWithViews(options =>
            {
                var policy = new AuthorizationPolicyBuilder()
                    .RequireAuthenticatedUser()
                    .Build();
                options.Filters.Add(new AuthorizeFilter(policy));
            }).AddNewtonsoftJson(options =>
            {
                options.SerializerSettings.ContractResolver = new DefaultContractResolver
                {
                    NamingStrategy = new CamelCaseNamingStrategy()
                };
                options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
            });
            services.AddSession();

            services.AddRazorPages();
            services.AddRestService(Configuration);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            Logger.Info($"Application running in envorinment: {env.EnvironmentName}");
            if (env.IsProduction() || env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                SetDeploymentURLs("Debug");
            }
            else
            {
                SetDeploymentURLs("Release");
                app.UseExceptionHandler("/Home/Error");
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");
                endpoints.MapRazorPages();
            });
        }

        private void SetDeploymentURLs(string buildConfiguration)
        {
            string jsonFile;
            using (StreamReader r = new StreamReader("deploymentUrls.json"))
            {
                jsonFile = r.ReadToEnd();
            }

            JObject deploymentFile = JObject.Parse(jsonFile);
            if (deploymentFile != null)
            {
                ApplicationURLS.SetURLS(
                    deploymentFile[buildConfiguration]["BackendBaseUrl"].ToString(),
                    deploymentFile[buildConfiguration]["WebAppBaseUrl"].ToString()
                );
            }
        }
    }
}
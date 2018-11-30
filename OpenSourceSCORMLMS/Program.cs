using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace OpenSourceSCORMLMS
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateWebHostBuilder(args).Build().Run();
        }

        public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
             .ConfigureLogging((hostingContext, builder) =>
             {
                 builder.AddConfiguration(hostingContext.Configuration.GetSection("Logging"));
                 builder.AddFile(o => o.RootPath = System.AppContext.BaseDirectory);
             })
                .UseStartup<Startup>();
    }
}

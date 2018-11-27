using Microsoft.EntityFrameworkCore;
using OpenSourceSCORMLMS.Data;


namespace OpenSourceSCORMLMS.Helpers
{
    public class ConnectionHelper
    {
 
        public static string getConnectionString()
        {
            return Helpers.ConfigurationHelper.DefaultConnection;
        }
        /// <summary>
        /// Convenience method to get the database context
        /// You can change the connections string in "getConnectionString"
        /// You can change the database by using options
        /// </summary>
        /// <returns></returns>
        public static ApplicationDbContext getContext()
        {
            string connectionString = getConnectionString();
            var options = new DbContextOptionsBuilder<ApplicationDbContext>();
            options.UseSqlServer(connectionString);
            ApplicationDbContext context = new Data.ApplicationDbContext(options.Options);
            return context;
        }
    }
}

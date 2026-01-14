using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace OpenSourceSCORMLMS.Data
{
    // this extends the auto-generated ApplicationDbContext with a custom Class for a Query Type
    public partial class ApplicationDbContext : IdentityDbContext
    {
        public DbSet<ModelSCORM.SCORM_Course_fromSP> SCORM_Course_FromSP { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder.Entity<ModelSCORM.SCORM_Course_fromSP>().HasNoKey().ToView(null);
        }
    }
}

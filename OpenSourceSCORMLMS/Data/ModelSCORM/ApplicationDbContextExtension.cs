using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace OpenSourceSCORMLMS.Data
{
    // this extends the auto-generated ApplicationDbContext with a custom Class for a Query Type
    public partial class ApplicationDbContext : IdentityDbContext
    {
        public DbQuery<ModelSCORM.SCORM_Course_fromSP> SCORM_Course_FromSP { get; set; }
    }
}

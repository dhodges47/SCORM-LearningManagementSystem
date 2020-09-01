using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace OpenSourceSCORMLMS.Migrations
{
    public partial class Initial : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(nullable: false),
                    Name = table.Column<string>(maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(nullable: false),
                    UserName = table.Column<string>(maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(maxLength: 256, nullable: true),
                    Email = table.Column<string>(maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(nullable: false),
                    PasswordHash = table.Column<string>(nullable: true),
                    SecurityStamp = table.Column<string>(nullable: true),
                    ConcurrencyStamp = table.Column<string>(nullable: true),
                    PhoneNumber = table.Column<string>(nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(nullable: false),
                    TwoFactorEnabled = table.Column<bool>(nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(nullable: true),
                    LockoutEnabled = table.Column<bool>(nullable: false),
                    AccessFailedCount = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "cmi_comment_from_learner",
                columns: table => new
                {
                    id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    n = table.Column<int>(nullable: true),
                    comment = table.Column<string>(maxLength: 4000, nullable: true),
                    location = table.Column<string>(maxLength: 250, nullable: true),
                    timestamp = table.Column<string>(maxLength: 50, nullable: true),
                    core_id = table.Column<int>(nullable: true),
                    SCORM_courses_id = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cmi_comment_from_learner", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "cmi_comment_from_lms",
                columns: table => new
                {
                    id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    n = table.Column<int>(nullable: true),
                    comment = table.Column<string>(maxLength: 4000, nullable: true),
                    location = table.Column<string>(maxLength: 250, nullable: true),
                    timestamp = table.Column<string>(maxLength: 50, nullable: true),
                    SCORM_Course_id = table.Column<int>(nullable: true),
                    SCO_identifier = table.Column<string>(maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cmi_comment_from_lms", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "cmi_core",
                columns: table => new
                {
                    core_id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    student_id = table.Column<string>(maxLength: 450, nullable: true),
                    student_name = table.Column<string>(maxLength: 255, nullable: true),
                    lesson_location = table.Column<string>(maxLength: 1000, nullable: true),
                    credit = table.Column<string>(maxLength: 9, nullable: true),
                    lesson_status = table.Column<string>(maxLength: 13, nullable: true),
                    entry = table.Column<string>(maxLength: 9, nullable: true),
                    score_raw = table.Column<decimal>(nullable: true),
                    score_min = table.Column<decimal>(nullable: true),
                    score_max = table.Column<decimal>(nullable: true),
                    total_time = table.Column<string>(maxLength: 20, nullable: true),
                    lesson_mode = table.Column<string>(maxLength: 6, nullable: true),
                    exit = table.Column<string>(maxLength: 8, nullable: true),
                    session_time = table.Column<string>(maxLength: 20, nullable: true),
                    SCORM_course_id = table.Column<int>(nullable: true),
                    sco_identifier = table.Column<string>(maxLength: 255, nullable: true),
                    timestamp = table.Column<DateTime>(type: "datetime", nullable: true),
                    score_scaled = table.Column<decimal>(nullable: true),
                    success_status = table.Column<string>(maxLength: 20, nullable: true),
                    completion_status = table.Column<string>(maxLength: 20, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cmi_core", x => x.core_id);
                });

            migrationBuilder.CreateTable(
                name: "cmi_data",
                columns: table => new
                {
                    id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    user_id = table.Column<string>(maxLength: 450, nullable: true),
                    SCORM_courses_id = table.Column<int>(nullable: false),
                    sco_id = table.Column<string>(maxLength: 100, nullable: false),
                    total_time = table.Column<string>(maxLength: 50, nullable: true),
                    launch_data = table.Column<string>(maxLength: 8000, nullable: true),
                    suspend_data = table.Column<string>(maxLength: 8000, nullable: true),
                    cmi_comments = table.Column<string>(type: "text", nullable: true),
                    cmi_comments_from_lms = table.Column<string>(maxLength: 8000, nullable: true),
                    mastery_score = table.Column<decimal>(nullable: true),
                    max_time_allowed = table.Column<string>(maxLength: 14, nullable: true),
                    time_limit_action = table.Column<string>(maxLength: 19, nullable: true),
                    scaled_passing_score = table.Column<decimal>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cmi_data", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "cmi_interactions",
                columns: table => new
                {
                    id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    n = table.Column<int>(nullable: true),
                    n_id = table.Column<string>(maxLength: 255, nullable: true),
                    interaction_time = table.Column<string>(maxLength: 50, nullable: true),
                    type = table.Column<string>(maxLength: 11, nullable: true),
                    weighting = table.Column<string>(maxLength: 50, nullable: true),
                    student_response = table.Column<string>(maxLength: 8000, nullable: true),
                    result = table.Column<string>(maxLength: 13, nullable: true),
                    latency = table.Column<string>(maxLength: 13, nullable: true),
                    core_id = table.Column<int>(nullable: false),
                    msrepl_tran_version = table.Column<Guid>(nullable: true),
                    description = table.Column<string>(maxLength: 255, nullable: true),
                    timestamp = table.Column<string>(maxLength: 20, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cmi_interactions", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "cmi_interactions_correct_responses",
                columns: table => new
                {
                    id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    interactions_id = table.Column<int>(nullable: true),
                    n = table.Column<int>(nullable: true),
                    pattern = table.Column<string>(maxLength: 8000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cmi_interactions_correct_responses", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "cmi_student_preferences",
                columns: table => new
                {
                    id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    audio = table.Column<int>(nullable: true),
                    language = table.Column<string>(maxLength: 255, nullable: true),
                    speed = table.Column<int>(nullable: true),
                    text = table.Column<int>(nullable: true),
                    user_id = table.Column<int>(nullable: false),
                    msrepl_tran_version = table.Column<Guid>(nullable: true),
                    audio_captioning = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cmi_student_preferences", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "SCORM_Course",
                columns: table => new
                {
                    id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    title_from_manifest = table.Column<string>(nullable: true),
                    title_from_upload = table.Column<string>(nullable: true),
                    pathToIndex = table.Column<string>(nullable: true),
                    pathToFolder = table.Column<string>(nullable: true),
                    DateUploaded = table.Column<DateTime>(nullable: false),
                    UserUploaded = table.Column<string>(maxLength: 450, nullable: true),
                    SCORM_version = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SCORM_Course", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    RoleId = table.Column<string>(nullable: false),
                    ClaimType = table.Column<string>(nullable: true),
                    ClaimValue = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    UserId = table.Column<string>(nullable: false),
                    ClaimType = table.Column<string>(nullable: true),
                    ClaimValue = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(maxLength: 128, nullable: false),
                    ProviderKey = table.Column<string>(maxLength: 128, nullable: false),
                    ProviderDisplayName = table.Column<string>(nullable: true),
                    UserId = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(nullable: false),
                    RoleId = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(nullable: false),
                    LoginProvider = table.Column<string>(maxLength: 128, nullable: false),
                    Name = table.Column<string>(maxLength: 128, nullable: false),
                    Value = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "cmi_objectives",
                columns: table => new
                {
                    id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    n = table.Column<int>(nullable: true),
                    n_id = table.Column<string>(maxLength: 255, nullable: true),
                    score_raw = table.Column<decimal>(nullable: true),
                    score_min = table.Column<decimal>(nullable: true),
                    score_max = table.Column<decimal>(nullable: true),
                    status = table.Column<string>(maxLength: 14, nullable: true),
                    core_id = table.Column<int>(nullable: false),
                    msrepl_tran_version = table.Column<Guid>(nullable: true),
                    score_scaled = table.Column<decimal>(nullable: true),
                    progress_measure = table.Column<decimal>(nullable: true),
                    success_status = table.Column<string>(maxLength: 20, nullable: true),
                    completion_status = table.Column<string>(maxLength: 20, nullable: true),
                    description = table.Column<string>(maxLength: 250, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cmi_objectives", x => x.id);
                    table.ForeignKey(
                        name: "FK_cmi_objectives_cmi_core_core_id",
                        column: x => x.core_id,
                        principalTable: "cmi_core",
                        principalColumn: "core_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "session",
                columns: table => new
                {
                    id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    sessionid = table.Column<string>(maxLength: 100, nullable: false),
                    user_id = table.Column<string>(maxLength: 450, nullable: true),
                    startdatetime = table.Column<DateTime>(type: "datetime", nullable: true),
                    enddatetime = table.Column<DateTime>(type: "datetime", nullable: true),
                    SCORM_Course_id = table.Column<int>(nullable: true),
                    SCO_identifier = table.Column<string>(maxLength: 100, nullable: true),
                    cmi_core_id = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_session", x => x.id);
                    table.ForeignKey(
                        name: "FK_session_cmi_core_cmi_core_id",
                        column: x => x.cmi_core_id,
                        principalTable: "cmi_core",
                        principalColumn: "core_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "cmi_interactions_objectives",
                columns: table => new
                {
                    id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    n = table.Column<int>(nullable: true),
                    interaction_n = table.Column<int>(nullable: true),
                    objective_id = table.Column<string>(maxLength: 255, nullable: true),
                    interactions_id = table.Column<int>(nullable: true),
                    msrepl_tran_version = table.Column<Guid>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cmi_interactions_objectives", x => x.id);
                    table.ForeignKey(
                        name: "FK_cmi_interactions_objectives_cmi_interactions_interactions_id",
                        column: x => x.interactions_id,
                        principalTable: "cmi_interactions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true,
                filter: "[NormalizedName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true,
                filter: "[NormalizedUserName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_cmi_interactions_objectives_interactions_id",
                table: "cmi_interactions_objectives",
                column: "interactions_id");

            migrationBuilder.CreateIndex(
                name: "IX_cmi_objectives_core_id",
                table: "cmi_objectives",
                column: "core_id");

            migrationBuilder.CreateIndex(
                name: "IX_session_cmi_core_id",
                table: "session",
                column: "cmi_core_id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "cmi_comment_from_learner");

            migrationBuilder.DropTable(
                name: "cmi_comment_from_lms");

            migrationBuilder.DropTable(
                name: "cmi_data");

            migrationBuilder.DropTable(
                name: "cmi_interactions_correct_responses");

            migrationBuilder.DropTable(
                name: "cmi_interactions_objectives");

            migrationBuilder.DropTable(
                name: "cmi_objectives");

            migrationBuilder.DropTable(
                name: "cmi_student_preferences");

            migrationBuilder.DropTable(
                name: "SCORM_Course");

            migrationBuilder.DropTable(
                name: "session");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "cmi_interactions");

            migrationBuilder.DropTable(
                name: "cmi_core");
        }
    }
}

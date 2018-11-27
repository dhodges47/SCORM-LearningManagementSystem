using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace OpenSourceSCORMLMS.Migrations
{
    public partial class Newtableusermodule : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Study.User_Module",
                columns: table => new
                {
                    id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    UserID = table.Column<string>(maxLength: 256, nullable: false),
                    SCORM_Courseid = table.Column<int>(nullable: true),
                    dtDateAdded = table.Column<DateTime>(nullable: true),
                    dtDateCompleted = table.Column<DateTime>(nullable: true),
                    dtDatePassed = table.Column<DateTime>(nullable: true),
                    dtDateLastOpened = table.Column<DateTime>(nullable: true),
                    dScore = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Study.User_Module", x => x.id);
                    table.ForeignKey(
                        name: "FK_Study.User_Module_SCORM_Course_SCORM_Courseid",
                        column: x => x.SCORM_Courseid,
                        principalTable: "SCORM_Course",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Study.User_Module_SCORM_Courseid",
                table: "Study.User_Module",
                column: "SCORM_Courseid");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Study.User_Module");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

namespace OpenSourceSCORMLMS.Migrations
{
    public partial class storedprocedures : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var sp = @"IF EXISTS (SELECT
    1
  FROM sys.objects
  WHERE object_id = OBJECT_ID(N'dbo.Sel_CoreTrackingID')
  AND TYPE IN (N'P', N'PC'))
  DROP PROCEDURE dbo.Sel_CoreTrackingID
GO
-- =============================================
-- Author:    David Hodges
-- Create date: 7/11/2018
-- Description:  get the id of an existing cmi_core row or insert a new one, and return the whole row 
-- =============================================
CREATE PROCEDURE [dbo].[Sel_CoreTrackingID] @SCORM_Course_id int,
@UserID nvarchar(450)

AS
BEGIN
  DECLARE @core_id int
  SELECT TOP 1
    @core_id = core_id
  FROM dbo.cmi_core
  WHERE student_id = @UserID
  AND SCORM_course_id = @SCORM_Course_id
  ORDER BY core_id DESC
  -- QUESTION about re-using cmi_core rows when they have completed a course
  IF @core_id IS NULL
    OR @core_id < 1
  BEGIN
    INSERT dbo.cmi_core (student_id, lesson_status, credit, lesson_mode, entry, SCORM_course_id)
      VALUES (@UserID, 'not attempted', 'credit', 'normal', 'ab-initio', @SCORM_Course_id)
    SELECT
      @core_id = @@IDENTITY
  END
  SELECT * FROM dbo.cmi_core WHERE core_id=@core_id
  
END";

            migrationBuilder.Sql(sp);

            var sp2 = @"IF EXISTS (SELECT
    1
  FROM sys.objects
  WHERE object_id = OBJECT_ID(N'dbo.Sel_CoursesWithUserIndicator')
  AND TYPE IN (N'P', N'PC'))
  DROP PROCEDURE dbo.Sel_CoursesWithUserIndicator
GO
-- =============================================
-- Author:    David Hodges
-- Create date: 11/12/2018
-- Description:  return all courses with an indicator as to whether the user has this course in their study area
-- =============================================

CREATE PROCEDURE [dbo].[Sel_CoursesWithUserIndicator] @userID nvarchar(450)
AS
BEGIN
  SELECT sc.id,
         title_from_manifest AS title,
         pathtoIndex,
         DateUploaded,
         COALESCE(um.id,0) as user_module_id FROM SCORM_Course sc
  LEFT JOIN [Study.User_Module] um
    ON sc.id = um.SCORM_Courseid
    AND um.UserID = @userID
  ORDER BY title_from_manifest
END";
            migrationBuilder.Sql(sp2);

            var sp3 = @"IF EXISTS (SELECT
    1
  FROM sys.objects
  WHERE object_id = OBJECT_ID(N'dbo.Sel_SessionID')
  AND TYPE IN (N'P', N'PC'))
  DROP PROCEDURE dbo.Sel_SessionID
GO
-- =============================================
-- Author:    David Hodges
-- Create date: 4/14/2018
-- Description:  insert a new Session row and return the id
-- =============================================
CREATE PROCEDURE [dbo].[Sel_SessionID] @SCORM_Course_id int,
@SCO_ID varchar(1000),
@user_id nvarchar(450),
@sessionID nvarchar(100),
@core_id int,
@dtStartDateTime datetime

AS
BEGIN
  DECLARE @id int

  INSERT dbo.session (sessionid, [user_id], startdatetime, cmi_core_id, scorm_course_id, sco_identifier)
    VALUES (@sessionID, @user_id, @dtStartDateTime, @core_id, @SCORM_Course_id, @SCO_ID)
  SELECT
    @id = @@IDENTITY

  SELECT id, sessionid, user_id, startdatetime, enddatetime, SCORM_Course_id, SCO_identifier, cmi_core_id from dbo.session where id=@id
    
END";
            migrationBuilder.Sql(sp3);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}

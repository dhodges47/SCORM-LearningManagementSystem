using System;
using System.Text;

namespace Models
{
    /// <summary>
    /// DataStructure used to pass data back and forth from the LMS's javascript runtime.
    /// </summary>


    [Serializable]
    public class LMSInfo
    {
        public LMSInfo()
        {


        }
        /// <summary>
        /// SessionID for identification purposes
        /// </summary>
        public string sessionId { get; set; }
        /// <summary>
        /// user_id
        /// </summary>
        public string userId { get; set; }
        public string coreId { get; set; }
        /// <summary>
        /// Identifier for the SCO (from the manifest, not guaranteed to be unique)
        /// </summary>
        public string scoIdentifier { get; set; }
        /// <summary>
        /// Identifier for the SCORM course
        /// </summary>
        public string scormCourseId { get; set; }
        /// <summary>
        /// DataItem for LMSSet/Get Calls
        /// </summary>
        public string dataItem { get; set; }
        /// <summary>
        /// Data value for LMSSet/Get calls
        /// </summary>
        public string dataValue { get; set; }
        /// <summary>
        /// Error Code (Or "0" for no error)
        /// </summary>
        public string errorCode { get; set; }
        /// <summary>
        /// Error String corresponding to ErrorCode
        /// </summary>
        public string errorString { get; set; }
        /// <summary>
        /// Error Diagnostic - additional info about the error
        /// </summary>
        public string errorDiagnostic { get; set; }
        /// <summary>
        /// Value to be returned to caller (sometimes this is just "true" or "false")
        /// </summary>
        public string returnValue { get; set; }

        //public override string ToString()
        //{
        //    StringBuilder s = new StringBuilder();
        //    s.Append("Core_id=");
        //    s.Append(this.coreId.ToString());
        //    s.Append("DataItem=");
        //    s.Append(this.dataItem.ToString());
        //    s.Append("DataValue=");
        //    s.Append(this.dataValue.ToString());
        //    s.Append("ErrorCode=");
        //    s.Append(this.errorCode.ToString());
        //    s.Append("ErrorDiagnostic=");
        //    s.Append(this.errorDiagnostic.ToString());
        //    s.Append("ErrorString=");
        //    s.Append(this.errorString.ToString());
        //    s.Append("ReturnValue=");
        //    s.Append(this.returnValue.ToString());
        //    s.Append("SCO_identifier=");
        //    s.Append(this.ScoIdentifier.ToString());
        //    s.Append("SCORM_course_id=");
        //    s.Append(this.ScormCourseId.ToString());
        //    s.Append("Sessionid=");
        //    s.Append(this.sessionId.ToString());
        //    s.Append("User_id=");
        //    s.Append(this.userId.ToString());
        //    return s.ToString();
        //}
    }

}


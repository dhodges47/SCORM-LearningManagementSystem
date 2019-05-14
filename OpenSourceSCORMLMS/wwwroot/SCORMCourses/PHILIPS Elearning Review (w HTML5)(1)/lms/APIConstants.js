
var VERSION = "3.8.2";

var PREFERENCE_DEFAULT = 0;
var PREFERENCE_OFF	   = -1;
var PREFERENCE_ON      = 1;

var LESSON_STATUS_PASSED        = 1;	//the user completed the content with a score sufficient to pass
var LESSON_STATUS_COMPLETED     = 2;	//the user completed the content
var LESSON_STATUS_FAILED        = 3;	//the user completed the content but his/her score was not sufficient to pass
var LESSON_STATUS_INCOMPLETE    = 4;	//the user began the content but did not complete it
var LESSON_STATUS_BROWSED       = 5;	//the user looked at the content but was not making a recorded attempt at it
var LESSON_STATUS_NOT_ATTEMPTED = 6;	//the user has not started the content

var ENTRY_REVIEW     = 1;
var ENTRY_FIRST_TIME = 2;
var ENTRY_RESUME     = 3;

var MODE_NORMAL = 1;
var MODE_BROWSE = 2;
var MODE_REVIEW = 3;

var MAX_CMI_TIME = 36002439990; //max CMI Timespan 9999:99:99.99

var NO_ERROR = 0;
var ERROR_LMS = 1;
var ERROR_INVALID_PREFERENCE = 2;
var ERROR_INVALID_NUMBER = 3;
var ERROR_INVALID_ID = 4;
var ERROR_INVALID_STATUS = 5;
var ERROR_INVALID_RESPONSE = 6;
var ERROR_NOT_LOADED = 7;
var ERROR_INVALID_INTERACTION_RESPONSE = 8;

var EXIT_TYPE_SUSPEND = "SUSPEND";
var EXIT_TYPE_FINISH  = "FINISH";
var EXIT_TYPE_TIMEOUT = "TIMEOUT";
var EXIT_TYPE_UNLOAD  = "UNLOAD";

var INTERACTION_RESULT_CORRECT  = "CORRECT";
var INTERACTION_RESULT_WRONG  = "WRONG";
var INTERACTION_RESULT_UNANTICIPATED  = "UNANTICIPATED";
var INTERACTION_RESULT_NEUTRAL = "NEUTRAL";

var INTERACTION_TYPE_TRUE_FALSE = "true-false";
var INTERACTION_TYPE_CHOICE = "choice";
var INTERACTION_TYPE_FILL_IN = "fill-in";
var INTERACTION_TYPE_LONG_FILL_IN = "long-fill-in";
var INTERACTION_TYPE_MATCHING = "matching";
var INTERACTION_TYPE_PERFORMANCE = "performance";
var INTERACTION_TYPE_SEQUENCING = "sequencing";
var INTERACTION_TYPE_LIKERT = "likert";
var INTERACTION_TYPE_NUMERIC = "numeric";

var DATA_CHUNK_PAIR_SEPARATOR = '###';
var DATA_CHUNK_VALUE_SEPARATOR = '$$';

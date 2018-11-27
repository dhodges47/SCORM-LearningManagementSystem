namespace Models
{
    public static class SignedInUser
    {
        // store info about signed-in user
        public static string User_id { get; set; }
        public static string Email { get; set; }
        public static string Fname { get; set; }
        public static string Lname { get; set; }
        public static bool isSignedIn { get; set; }
    }
}
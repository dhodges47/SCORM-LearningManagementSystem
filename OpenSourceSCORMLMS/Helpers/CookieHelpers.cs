using System.Collections.Generic;
using System.Linq;

namespace OpenSourceSCORMLMS.Helpers
{
    /// <summary>
    /// Allow storing a dictionary of values in a single cookie
    /// From https://stackoverflow.com/a/43831482/3236491
    /// </summary>
    public static class CookieHelper
    {
        public static IDictionary<string, string> FromLegacyCookieString(this string legacyCookie)
        {
            return legacyCookie.Split('&').Select(s => s.Split('=')).ToDictionary(kvp => kvp[0], kvp => kvp[1]);
        }

        public static string ToLegacyCookieString(this IDictionary<string, string> dict)
        {
            return string.Join("&", dict.Select(kvp => string.Join("=", kvp.Key, kvp.Value)));
        }
    }
}

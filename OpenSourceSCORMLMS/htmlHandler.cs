using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using OpenSourceSCORMLMS.Middleware;
using System.Threading.Tasks;
//
// this is a trial to see if I can filter all html requests
//
namespace OpenSourceSCORMLMS.Middleware
{
    // the purpose of the HtmlHandler is to make sure that when people are running SCORM courses (i.e. native html files) that they are authenticated

    public class htmlHandler
    {
        private readonly RequestDelegate _next;
        public htmlHandler(RequestDelegate next)
        {
            _next = next;
        }
        public async Task InvokeAsync(HttpContext httpContext)
        {
            // this is where you can do operations on the request and short circuit it if necessary
            if (httpContext.Request.Path.Value.StartsWith("/SCORM"))
            {
                if (!httpContext.User.Identity.IsAuthenticated)

                {
                    // if user is not authenticated. Could also check to make sure user has that course

                    await httpContext.Response.WriteAsync("Access denied. User is not authenticated");

                    return;

                }
            }
            await _next(httpContext);
        }

    }

}
public static class htmlHandlerExtensions
{
    public static IApplicationBuilder UseHtmlHandler(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<htmlHandler>();
    }
}




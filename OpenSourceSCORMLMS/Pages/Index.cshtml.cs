using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace OpenSourceSCORMLMS.Pages
{
    public class IndexModel : PageModel
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly SignInManager<IdentityUser> _signInManager;
        public IndexModel(UserManager<IdentityUser> _User, SignInManager<IdentityUser> SignIn)
        {
            _userManager = _User;
            _signInManager = SignIn;

        }
        public void OnGet()
        {
            if (_signInManager.IsSignedIn(User))
            {
                Models.SignedInUser.User_id =  _userManager.GetUserId(User);
                Models.SignedInUser.Email =  _userManager.GetUserName(User);
                Models.SignedInUser.isSignedIn = true;
            }
        }
    }
}

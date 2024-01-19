using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using UniversityManagementSystem;
using UniversityManagementSystem.Models;
using UniversityManagementSystem.Services.UserService;
using UniversityManagementSystem.Services.UserService;
using System.Security.Claims;

namespace PrisonSystemManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProfileController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly IUserService _userService;
        private readonly IOptions<AppSettings> _appSettings;
        public ProfileController(IUserService userService, IOptions<AppSettings> appSettings, DataContext context)
        {
            _userService = userService;
            _appSettings = appSettings;
            _context = context;
        }

        [HttpGet("name")]
        [Authorize]
        public ActionResult<object> GetMe()
        {
            var userName = _userService.GetMyName();
            var response = new { username = userName }; // Create an object with the username property

            // Get the current user's token
            var token = HttpContext.Request.Headers["Authorization"];

            // Set the Authorization header in the response
            Response.Headers.Add("Authorization", token);

            // Expose the Authorization header to the frontend
            Response.Headers.Add("Access-Control-Expose-Headers", "Authorization");

            return Ok(response); // Return the response object as JSON
        }

        //[HttpGet("additional-data")]
        //[Authorize]
      // [HttpGet("user-data")]
      // [Authorize]
      // public ActionResult<string> GetUserData()
      // {
      //     var userData = _userService.GetUserNameAndSurname();
      //
      //     // Get the current user's token
      //     var token = HttpContext.Request.Headers["Authorization"];
      //
      //     // Set the Authorization header in the response
      //     Response.Headers.Add("Authorization", token);
      //
      //     // Expose the Authorization header to the frontend
      //     Response.Headers.Add("Access-Control-Expose-Headers", "Authorization");
      //
      //     return Ok(userData);
      // }


        [HttpGet("userinfo")]
        [Authorize]
        public ActionResult<object> GetUserInfo()
        {
            var nameClaim = User.FindFirst(ClaimTypes.Name);
            var surnameClaim = User.FindFirst(ClaimTypes.Surname);
            var profilePictureClaim = User.FindFirst("ProfilePicture");

            if (nameClaim == null || surnameClaim == null || profilePictureClaim == null)
            {
                // Unable to find name, surname, and/or profile picture claims
                return BadRequest(new { ErrorMessage = "Name, surname, and/or profile picture not found." });
            }

            var name = nameClaim.Value;
            var surname = surnameClaim.Value;
            var profilePicture = profilePictureClaim.Value;

            var fullProfilePicture = Path.Combine(_appSettings.Value.ImageStoragePath, profilePicture);

            var userInfo = new
            {
                Name = name,
                Surname = surname,
                ProfilePicture = fullProfilePicture
            };

            return Ok(userInfo);
        }

        [HttpGet("user-info")]
        [Authorize]
        public ActionResult<object> GetLoggedInUserInfo()
        {
            var user_idClaim = User.FindFirst("user_id");

            if (user_idClaim == null)
            {
                // Unable to find the user ID claim
                return BadRequest(new { ErrorMessage = "User ID not found." });
            }

            int user_id;
            if (!int.TryParse(user_idClaim.Value, out user_id))
            {
                // Unable to parse the user ID
                return BadRequest(new { ErrorMessage = "Invalid user ID." });
            }

            // Assuming you have access to your data context and the Users table
            var user = _context.Users.FirstOrDefault(u => u.user_id == user_id);

            if (user == null)
            {
                // User not found in the database
                return BadRequest(new { ErrorMessage = "User not found." });
            }

            var userInfo = new
            {
                UserId=user_id,
                Name = user.name,
                Surname = user.surname,
               
            };

            return Ok(userInfo);
        }


    }
}

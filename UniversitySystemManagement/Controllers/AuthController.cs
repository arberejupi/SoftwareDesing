using UniversityManagementSystem.Services.UserService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using UniversityManagementSystem.Models;
using UniversityManagementSystem.DTO;
using System.Text;
using UniversityManagementSystem.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace UniversityManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        public static Users users = new Users();
        private readonly IConfiguration _configuration;
        private readonly IUserService _userService;
        private DataContext _context;
        private readonly IOptions<AppSettings> _appSettings;

        public AuthController(IConfiguration configuration, IUserService userService, DataContext context, IOptions<AppSettings> appSettings)
        {
            _configuration = configuration;
            _userService = userService;
            _context = context;
            _appSettings = appSettings;
        }
        [HttpGet("search")]
        public IActionResult SearchUsers()
        {
            var users = _userService.GetAllUsers();
            return Ok(users);
        }

 


        [HttpGet]
        public async Task<ActionResult<List<Users>>> Get()
        {
            return Ok(await _context.Users.ToListAsync());
        }

        [HttpGet("usernames")]
        public async Task<ActionResult<List<object>>> GetUsernames()
        {
            var usernames = await _context.Users
                .Select(user => new { user_id = user.user_id, username = user.username })
                .ToListAsync();

            return Ok(usernames);
        }


        [HttpPost("register")]
        public async Task<ActionResult<Users>> Register(RegisterDto request)
        {
            request.Password= hashPassword(request.Password);
            users.user_id = 0;
            users.username = request.UserName;
            users.name = request.name;
            users.surname = request.surname;
            users.password = request.Password;
            users.roleName = request.Role;
            hashPassword(request.Password);
            _context.Users.Add(users);
            await _context.SaveChangesAsync();

            return Ok(users);
        }


        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteUser(int id)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);

                if (user == null)
                {
                    return NotFound("User not found");
                }

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                return Ok("User deleted successfully");
            }
            catch (Exception ex)
            {
                return BadRequest($"Failed to delete user: {ex.Message}");
            }
        }


        [HttpPost("login")]
        public async Task<ActionResult<object>> Login(LoginDto request)
        {
            try
            {
                string password = hashPassword(request.password);
                var dbUser = _context.Users.FirstOrDefault(u => u.username == request.username && u.password == password);
                if (dbUser == null)
                {
                    return BadRequest("Username or password is incorrect");
                }

                string token = CreateToken(dbUser);
                var refreshToken = GenerateRefreshToken();
                SetRefreshToken(refreshToken, dbUser); // Update the user's RefreshToken and token-related properties
                await _context.SaveChangesAsync(); // Save changes to the database

                var response = new { token, role = dbUser.roleName, userId = dbUser.user_id }; // Include user_id in the response
                return Ok(response);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        private void SetRefreshToken(RefreshToken newRefreshToken, Users user)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = newRefreshToken.Expires
            };
            Response.Cookies.Append("refreshToken", newRefreshToken.Token, cookieOptions);

            user.RefreshToken = newRefreshToken.Token;
            user.TokenCreated = newRefreshToken.Created;
            user.TokenExpires = newRefreshToken.Expires;
        }


        private RefreshToken GenerateRefreshToken()
        {
            var refreshToken = new RefreshToken
            {
                Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
                Expires = DateTime.Now.AddDays(7),
                Created = DateTime.Now
            };

            return refreshToken;
        }

        private void SetRefreshToken(RefreshToken newRefreshToken)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = newRefreshToken.Expires
            };
            Response.Cookies.Append("refreshToken", newRefreshToken.Token, cookieOptions);

            users.RefreshToken = newRefreshToken.Token;
            users.TokenCreated = newRefreshToken.Created;
            users.TokenExpires = newRefreshToken.Expires;
        }

        private string CreateToken(Users user)
        {
            List<Claim> claims = new List<Claim>
    {
        new Claim("user_id", user.user_id.ToString()),
        new Claim(ClaimTypes.SerialNumber, user.user_id.ToString()),
        new Claim("username", user.username),
        new Claim(ClaimTypes.GivenName, user.username),
        new Claim("name", user.name),
        new Claim(ClaimTypes.Name, user.name),
        new Claim("surname", user.surname),
        new Claim(ClaimTypes.Surname, user.surname),
        new Claim("role", user.roleName),
        new Claim(ClaimTypes.Role, user.roleName),

    };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration.GetSection("AppSettings:Token").Value));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);

            return jwt;
        }

        static string hashPassword(string password)
        {
            var sha = SHA256.Create();
            var asByteArray = Encoding.Default.GetBytes(password);
            var hashedPassword = sha.ComputeHash(asByteArray);
            return Convert.ToBase64String(hashedPassword);
        }


        [HttpGet("{userId}")]
        public async Task<ActionResult<Users>> GetUserById(int userId)
        {
            var user = await _context.Users
                .Where(u => u.user_id == userId)
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Users>> EditUser(int id, EditUserDto request)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);

                if (user == null)
                {
                    return NotFound("User not found");
                }

                // Update user properties with the values from the request
                user.username = request.UserName;
                user.name = request.Name;
                user.surname = request.Surname;
                user.roleName = request.Role;

                // Check if a new password is provided
                if (!string.IsNullOrEmpty(request.Password))
                {
                    // Hash the new password
                    user.password = hashPassword(request.Password);
                }

                // Save changes to the database
                await _context.SaveChangesAsync();

                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest($"Failed to edit user: {ex.Message}");
            }
        }

        [HttpGet("teachers")]
        public async Task<ActionResult<List<Users>>> GetTeachers()
        {
            var teachers = await _context.Users
                .Where(u => u.roleName == "Teacher")
                .ToListAsync();

            return Ok(teachers);
        }

        [HttpGet("students")]
        public async Task<ActionResult<List<Users>>> GetStudents()
        {
            var teachers = await _context.Users
                .Where(u => u.roleName == "Student")
                .ToListAsync();

            return Ok(teachers);
        }

        [HttpGet("Management")]
        public async Task<ActionResult<List<Users>>> GetManagement()
        {
            var teachers = await _context.Users
                .Where(u => u.roleName == "Management")
                .ToListAsync();

            return Ok(teachers);
        }

        [Authorize]
        [HttpGet("getMyName")]
        public ActionResult<string> GetMyName()
        {
            string myName = _userService.GetMyName();
            return Ok(myName);
        }

        [Authorize]
        [HttpGet("getUserDetails")]
        public async Task<ActionResult<object>> GetUserDetails()
        {
            try
            {
                var loggedInUserId = int.Parse(User.FindFirstValue("user_id")); // Get the logged-in user's user_id

                // Check if the user exists in the database
                var user = await _context.Users.FirstOrDefaultAsync(u => u.user_id == loggedInUserId);

                if (user == null)
                {
                    return NotFound("User not found");
                }

                // Determine the user type based on the roleName
                string userType = "";
                object additionalAttributes = null;

                switch (user.roleName)
                {
                    case "Student":
                        var student = await _context.Student.FirstOrDefaultAsync(s => s.user_id == loggedInUserId);
                        if (student != null)
                        {
                            // Additional properties specific to students
                            userType = "Student";
                            additionalAttributes = new
                            {
                                student.student_id,
                                student.date_of_birth,
                                student.gender,
                                student.email,
                                student.phone_number,
                                student.address,
                                student.department_id
                                // Add other student-specific properties as needed
                            };
                        }
                        break;

                    case "Teacher":
                        var teacher = await _context.Teacher.FirstOrDefaultAsync(t => t.user_id == loggedInUserId);
                        if (teacher != null)
                        {
                            // Additional properties specific to teachers can be added here
                            userType = "Teacher";
                            additionalAttributes = new
                            {
                                teacher.teacher_id,
                                teacher.department_id,
                                teacher.academic_rank,
                                teacher.office_location,
                                teacher.office_hours,
                                teacher.research_interests
                            };
                        }
                        break;

                    case "Management":
                        var management = await _context.Management.FirstOrDefaultAsync(m => m.user_id == loggedInUserId);
                        if (management != null)
                        {
                            // Additional properties specific to management can be added here
                            userType = "Management";
                            additionalAttributes = new
                            {
                                management.management_id,
                                management.position,
                                management.university_id
                            };
                        }
                        break;
                }

                // You can customize the response based on the user type
                var userDetails = new
                {
                    UserId = user.user_id,
                    Username = user.username,
                    Name = user.name,
                    Surname = user.surname,
                    UserType = userType,
                    AdditionalAttributes = additionalAttributes // Additional attributes specific to the user type
                                                                // Add other common properties as needed
                };

                return Ok(userDetails);
            }
            catch (Exception ex)
            {
                return BadRequest($"Failed to get user details: {ex.Message}");
            }
        }


    }
}

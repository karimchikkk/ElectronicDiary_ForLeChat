using Microsoft.AspNetCore.Mvc;
using SchoolDiary.Data;
using SchoolDiary.DTOs;
using SchoolDiary.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Security.Claims;

namespace SchoolDiary.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public IActionResult CreateUser(string fullName, string accessCode, Role role, int? classId)
        {
            var user = new User
            {
                FullName = fullName,
                AccessCode = accessCode,
                Role = role,
                ClassId = classId
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok(user);
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto dto)
        {
            var user = _context.Users
                .FirstOrDefault(u =>
                    u.AccessCode == dto.AccessCode &&
                    u.FullName == dto.FullName);

            if (user == null)
                return Unauthorized("Неверный код или имя");

            var key = Encoding.UTF8.GetBytes("SUPER_SECRET_KEY_123456");

            var tokenHandler = new JwtSecurityTokenHandler();

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("id", user.Id.ToString()),
                    new Claim("name", user.FullName),
                    new Claim("role", user.Role.ToString()),
                    new Claim(ClaimTypes.Role, user.Role.ToString())
                }),
                Expires = DateTime.UtcNow.AddHours(2),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);

            return Ok(new
            {
                token = tokenHandler.WriteToken(token),
                user.Id,
                user.FullName,
                user.Role
            });
        }
        [HttpGet("students")]
        public IActionResult GetStudents()
        {
            var students = _context.Users
                .Where(u => u.Role == Role.Student)
                .Select(u => new
                {
                    u.Id,
                    u.FullName
                })
                .ToList();

            return Ok(students);
        }
        [HttpGet("teachers")]
        public IActionResult GetTeachers()
        {
            var teachers = _context.Users
                .Where(u => u.Role == Role.Teacher)
                .Select(u => new
                {
                    u.Id,
                    u.FullName
                })
                .ToList();

            return Ok(teachers);
        }
    }
}
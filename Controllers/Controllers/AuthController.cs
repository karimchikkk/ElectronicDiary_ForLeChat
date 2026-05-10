using Microsoft.AspNetCore.Mvc;
using SchoolDiary.Data;
using SchoolDiary.DTOs;

namespace SchoolDiary.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto dto)
        {
            var user = _context.Users
                .FirstOrDefault(u => u.AccessCode == dto.AccessCode);

            if (user == null)
                return Unauthorized("Неверный код");

            return Ok(new
            {
                user.Id,
                user.FullName,
                user.Role,
                user.ClassId
            });
        }
    }
}
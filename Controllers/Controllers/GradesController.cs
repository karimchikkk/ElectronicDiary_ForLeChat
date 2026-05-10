using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using SchoolDiary.Data;
using SchoolDiary.DTOs;

namespace SchoolDiary.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GradesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GradesController(AppDbContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpPost("add")]
        public IActionResult Add([FromBody] AddGradeDto dto)
        {
            var grade = new Grade
            {
                UserId = dto.UserId,
                SubjectId = dto.SubjectId,
                Value = dto.Value,
                Date = DateTime.Now
            };

            _context.Grades.Add(grade);
            _context.SaveChanges();

            return Ok(grade);
        }

        [Authorize]
        [HttpGet("user/{userId}")]
        public IActionResult GetUserGrades(int userId)
        {
            var grades = _context.Grades
                .Where(g => g.UserId == userId)
                .Select(g => new
                {
                    g.Id,
                    g.Value,
                    g.Date,
                    // Переименовали Subject в subjectName
                    subjectName = _context.Subjects
                        .Where(s => s.Id == g.SubjectId)
                        .Select(s => s.Name)
                        .FirstOrDefault()
                })
                .ToList();

            return Ok(grades);
        }

    }
}
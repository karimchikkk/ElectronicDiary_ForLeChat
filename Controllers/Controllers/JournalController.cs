using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolDiary.Data;
using SchoolDiary.DTOs;
using SchoolDiary.Models;

namespace SchoolDiary.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class JournalController : ControllerBase
    {
        private readonly AppDbContext _context;

        public JournalController(AppDbContext context)
        {
            _context = context;
        }
        [HttpGet("class/{classId}/subject/{subjectId}")]
        public IActionResult GetBoard(int classId, int subjectId)
        {
            var data = _context.Users
                .Where(u => u.ClassId == classId && u.Role == 0) // Берем только учеников (Role 0)
                .Select(u => new
                {
                    // Названия полей должны быть как в интерфейсе фронтенда (camelCase)
                    studentId = u.Id,
                    studentName = u.FullName,
                    grades = _context.Grades
                        .Where(g => g.UserId == u.Id && g.SubjectId == subjectId)
                        .Select(g => new
                        {
                            date = g.Date,
                            value = g.Value
                        })
                        .ToList()
                })
                .ToList();

            return Ok(data);
        }
    }
}
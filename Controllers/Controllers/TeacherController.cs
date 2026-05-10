using Microsoft.AspNetCore.Mvc;
using SchoolDiary.Data;
using SchoolDiary.Models;

namespace SchoolDiary.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TeachersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TeachersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("assign")]
        public IActionResult AssignTeacher(int teacherId, int subjectId)
        {
            var ts = new TeacherSubject
            {
                TeacherId = teacherId,
                SubjectId = subjectId
            };

            _context.TeacherSubjects.Add(ts);
            _context.SaveChanges();

            return Ok(ts);
        }
        [HttpGet("{teacherId}/subjects")]
        public IActionResult GetTeacherSubjects(int teacherId)
        {
            var subjects = _context.TeacherSubjects
                .Where(ts => ts.TeacherId == teacherId)
                .Select(ts => new
                {
                    ts.Subject.Id,
                    ts.Subject.Name
                })
                .ToList();
            return Ok(subjects);
        }
        [HttpPost("create")]
        public IActionResult CreateSubject([FromBody] SubjectDto dto)
        {
            var subject = new Subject { Name = dto.Name };
            _context.Subjects.Add(subject);
            _context.SaveChanges();
            return Ok(subject);
        }
    }
}
using Microsoft.AspNetCore.Mvc;
using SchoolDiary.Data;
using SchoolDiary.DTOs;

namespace SchoolDiary.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubjectsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SubjectsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("all")]
        public IActionResult GetAll()
        {
            return Ok(_context.Subjects
                .Select(s => new
                {
                    s.Id,
                    s.Name
                })
                .ToList());
        }

        [HttpPost("create")]
        public IActionResult Create([FromBody] SubjectCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest("Название предмета обязательно");

            var subject = new Subject { Name = dto.Name };
            _context.Subjects.Add(subject);
            _context.SaveChanges();

            return Ok(subject);
        }
    }
}
using Microsoft.AspNetCore.Mvc;
using SchoolDiary.Data;
using SchoolDiary.Models;

namespace SchoolDiary.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClassesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ClassesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("create")]//тестовое добавление класса
        public IActionResult Create(string name)
        {
            var cls = new Class { Name = name};
                
            _context.Classes.Add(cls);
            _context.SaveChanges();

            return Ok(cls);
        }

        [HttpGet("all")]
        public IActionResult GetAll()
        {
            return Ok(_context.Classes.ToList());
        }
    }
}
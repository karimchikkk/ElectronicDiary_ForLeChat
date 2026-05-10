using System.Security.Claims;

namespace SchoolDiary.Models
{
    public class User
    {
        public int Id { get; set; }
        public string FullName { get; set; }

        public Role Role { get; set; }
        public bool LoggedIn {  get; set; } = false;
        // код для регистрации (как ты хотел)
        public string AccessCode { get; set; }

        // если ученик — он в классе
        public int? ClassId { get; set; }

        public Class Class { get; set; }
        public List<Grade> Grades { get; set; } = new();
        public ICollection<TeacherSubject> TeacherSubjects { get; set; } = new List<TeacherSubject>();
    }
}

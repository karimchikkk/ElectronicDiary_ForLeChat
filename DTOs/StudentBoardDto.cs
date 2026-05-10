namespace SchoolDiary.DTOs
{
    public class StudentBoardDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; }

        public List<GradeDto> Grades { get; set; }
    }

    public class GradeDto
    {
        public int Value { get; set; }
        public string SubjectName { get; set; }
        public DateTime Date { get; set; }
    }
}
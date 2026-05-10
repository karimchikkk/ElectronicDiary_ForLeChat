using SchoolDiary.Models;

public class TeacherSubject
{
    public int TeacherId { get; set; }
    public User Teacher { get; set; }

    public int SubjectId { get; set; }
    public Subject Subject { get; set; }
}
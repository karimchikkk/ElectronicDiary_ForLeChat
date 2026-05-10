namespace SchoolDiary.Models
{
    public class Class
    {
        public int Id { get; set; }
        public string Name { get; set; } // например 5A, 6B

        public List<User> Users { get; set; }
    }
}
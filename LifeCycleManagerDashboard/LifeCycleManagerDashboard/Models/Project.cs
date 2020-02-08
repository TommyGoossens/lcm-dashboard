namespace LifeCycleManagerDashboard.Models
{
    public class Project
    {
        public long ProjectId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public ContactPerson ContactPerson { get; set; }
    }

    public class ContactPerson
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string PhoneNr { get; set; }

        public ContactPerson(string name, string email, string phoneNr)
        {
            this.Name = name;
            this.Email = email;
            this.PhoneNr = phoneNr;
        }
    }
}
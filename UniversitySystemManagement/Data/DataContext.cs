using Microsoft.EntityFrameworkCore;
using UniversityManagementSystem.Models;

namespace UniversityManagementSystem.Data
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options)
        {
        }

        public DbSet<Users> Users { get; set; }
        public DbSet<Role> Role { get; set; }
        public DbSet<University> University { get; set; }
        public DbSet<Department> Department { get; set; }
        public DbSet<Management> Management { get; set; }
        public DbSet<Faculty> Faculty { get; set; }
        public DbSet<Course> Course { get; set; }
        public DbSet<Student> Student { get; set; }
        public DbSet<Schedule> Schedule { get; set; }
        public DbSet<Room> Room { get; set; }
        public DbSet<Teacher> Teacher { get; set; }
        public DbSet<Enrollment> Enrollment { get; set; }

        //protected override void OnModelCreating(ModelBuilder modelBuilder)
        //{
        //    // Configure cascading delete for Like entity
        //
        //    modelBuilder.Entity<Like>()
        //        .HasOne(l => l.Post)
        //        .WithMany()
        //        .HasForeignKey(l => l.PostId)
        //        .OnDelete(DeleteBehavior.Restrict);
        //
        //    // Configure cascading delete for Comment entity
        //
        //    modelBuilder.Entity<Comment>()
        //        .HasOne(c => c.Post)
        //        .WithMany()
        //        .HasForeignKey(c => c.PostId)
        //        .OnDelete(DeleteBehavior.Restrict);
        //
        //    // Other configurations...
        //
        //    base.OnModelCreating(modelBuilder);
        //}
    }
}

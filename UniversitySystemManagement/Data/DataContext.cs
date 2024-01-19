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

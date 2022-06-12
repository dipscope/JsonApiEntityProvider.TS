using Microsoft.EntityFrameworkCore;

namespace JsonApiNet
{
    public class AppDbContext : DbContext
    {
        public DbSet<Company> Companies => Set<Company>();
        public DbSet<Message> Messages => Set<Message>();
        public DbSet<User> Users => Set<User>();
        public DbSet<UserStatus> UserStatuses => Set<UserStatus>();

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
            return;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlite("Filename=JsonApiNet.db");

            return;
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .HasOne(u => u.UserStatus)
                .WithMany(us => us.Users)
                .HasForeignKey(u => u.UserStatusId);

            modelBuilder.Entity<User>()
                .HasOne(u => u.Company)
                .WithMany(c => c.Users)
                .HasForeignKey(u => u.CompanyId);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.User)
                .WithMany(u => u.Messages)
                .HasForeignKey(m => m.UserId);

            return;
        }
    }
}

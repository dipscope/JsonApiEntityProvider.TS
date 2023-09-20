using Microsoft.EntityFrameworkCore;

namespace JsonApiNet
{
    public class AppDbContext : DbContext
    {
        public DbSet<Company> Companies => Set<Company>();
        public DbSet<Message> Messages => Set<Message>();
        public DbSet<User> Users => Set<User>();
        public DbSet<UserStatus> UserStatuses => Set<UserStatus>();
        public DbSet<Human> Humans => Set<Human>();
        public DbSet<Woman> Womans => Set<Woman>();
        public DbSet<Man> Mans => Set<Man>();

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
            return;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseNpgsql("Host=jsonapinet.db;Database=postgres;Username=postgres;Password=postgres");

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

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Parent)
                .WithMany(p => p.Messages)
                .HasForeignKey(m => m.MessageId);

            modelBuilder.Entity<Human>()
                .HasDiscriminator<string>("HumanType")
                .HasValue<Man>("man")
                .HasValue<Woman>("woman");

            modelBuilder.Entity<Human>()
                .HasOne(h => h.Father)
                .WithMany()
                .HasForeignKey(h => h.FatherId);

            modelBuilder.Entity<Human>()
                .HasOne(h => h.Mother)
                .WithMany()
                .HasForeignKey(h => h.MotherId);

            modelBuilder.Entity<Human>()
                .HasOne(h => h.Spouse)
                .WithMany()
                .HasForeignKey(h => h.SpouseId);

            return;
        }
    }
}

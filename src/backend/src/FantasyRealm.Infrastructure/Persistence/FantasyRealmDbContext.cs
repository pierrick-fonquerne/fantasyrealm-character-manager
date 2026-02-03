using FantasyRealm.Domain.Entities;
using FantasyRealm.Domain.Enums;
using FantasyRealm.Infrastructure.Persistence.Conventions;
using FantasyRealm.Infrastructure.Persistence.Converters;
using Microsoft.EntityFrameworkCore;

namespace FantasyRealm.Infrastructure.Persistence
{
    /// <summary>
    /// Entity Framework Core database context for PostgreSQL.
    /// </summary>
    public class FantasyRealmDbContext(DbContextOptions<FantasyRealmDbContext> options) : DbContext(options)
    {
        public DbSet<Role> Roles { get; set; } = null!;

        public DbSet<User> Users { get; set; } = null!;

        public DbSet<Character> Characters { get; set; } = null!;

        public DbSet<Article> Articles { get; set; } = null!;

        public DbSet<CharacterArticle> CharacterArticles { get; set; } = null!;

        public DbSet<Comment> Comments { get; set; } = null!;

        public DbSet<CharacterClass> CharacterClasses { get; set; } = null!;

        public DbSet<EquipmentSlot> EquipmentSlots { get; set; } = null!;

        protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
        {
            base.ConfigureConventions(configurationBuilder);

            configurationBuilder.Properties<DateTime>()
                .HaveConversion<UtcDateTimeConverter>();
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            ConfigureRole(modelBuilder);
            ConfigureUser(modelBuilder);
            ConfigureCharacter(modelBuilder);
            ConfigureArticle(modelBuilder);
            ConfigureCharacterArticle(modelBuilder);
            ConfigureComment(modelBuilder);
            ConfigureCharacterClass(modelBuilder);
            ConfigureEquipmentSlot(modelBuilder);

            modelBuilder.ApplySnakeCaseNamingConvention();
        }

        private static void ConfigureRole(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Role>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Label).HasMaxLength(50).IsRequired();
                entity.HasIndex(e => e.Label).IsUnique();
            });
        }

        private static void ConfigureUser(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Pseudo).HasMaxLength(50).IsRequired();
                entity.Property(e => e.Email).HasMaxLength(255).IsRequired();
                entity.Property(e => e.PasswordHash).HasMaxLength(255).IsRequired();
                entity.Property(e => e.IsSuspended).HasDefaultValue(false);
                entity.Property(e => e.MustChangePassword).HasDefaultValue(false);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasIndex(e => e.Pseudo).IsUnique();
                entity.HasIndex(e => e.Email).IsUnique();

                entity.HasOne(e => e.Role)
                      .WithMany(r => r.Users)
                      .HasForeignKey(e => e.RoleId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }

        private static void ConfigureCharacter(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Character>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(50).IsRequired();
                entity.Property(e => e.Gender)
                      .HasConversion(
                          v => v.ToString().ToLowerInvariant(),
                          v => Enum.Parse<Gender>(v, true))
                      .HasMaxLength(20)
                      .IsRequired();
                entity.Property(e => e.SkinColor).HasMaxLength(7).IsRequired();
                entity.Property(e => e.EyeColor).HasMaxLength(7).IsRequired();
                entity.Property(e => e.HairColor).HasMaxLength(7).IsRequired();
                entity.Property(e => e.HairStyle).HasMaxLength(50).IsRequired();
                entity.Property(e => e.EyeShape).HasMaxLength(50).IsRequired();
                entity.Property(e => e.NoseShape).HasMaxLength(50).IsRequired();
                entity.Property(e => e.MouthShape).HasMaxLength(50).IsRequired();
                entity.Property(e => e.FaceShape).HasMaxLength(50).IsRequired();
                entity.Property(e => e.IsShared).HasDefaultValue(false);
                entity.Property(e => e.Status)
                      .HasConversion(
                          v => v.ToString().ToLowerInvariant(),
                          v => Enum.Parse<CharacterStatus>(v, true))
                      .HasMaxLength(20)
                      .HasDefaultValue(CharacterStatus.Draft);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasIndex(e => new { e.Name, e.UserId }).IsUnique();
                entity.HasIndex(e => e.Status);

                entity.HasOne(e => e.User)
                      .WithMany(u => u.Characters)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Class)
                      .WithMany()
                      .HasForeignKey(e => e.ClassId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }

        private static void ConfigureArticle(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Article>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
                entity.Property(e => e.Type)
                      .HasConversion(
                          v => v.ToString().ToLowerInvariant(),
                          v => Enum.Parse<ArticleType>(v, true))
                      .HasMaxLength(20)
                      .IsRequired();
                entity.Property(e => e.IsActive).HasDefaultValue(true);

                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.IsActive);
            });
        }

        private static void ConfigureCharacterArticle(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<CharacterArticle>(entity =>
            {
                entity.HasKey(e => new { e.CharacterId, e.ArticleId });

                entity.HasOne(e => e.Character)
                      .WithMany(c => c.CharacterArticles)
                      .HasForeignKey(e => e.CharacterId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Article)
                      .WithMany(a => a.CharacterArticles)
                      .HasForeignKey(e => e.ArticleId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }

        private static void ConfigureComment(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Comment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Rating).IsRequired();
                entity.Property(e => e.Text).IsRequired();
                entity.Property(e => e.Status)
                      .HasConversion(
                          v => v.ToString().ToLowerInvariant(),
                          v => Enum.Parse<CommentStatus>(v, true))
                      .HasMaxLength(20)
                      .HasDefaultValue(CommentStatus.Pending);
                entity.Property(e => e.CommentedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasIndex(e => new { e.CharacterId, e.AuthorId }).IsUnique();
                entity.HasIndex(e => e.Status);

                entity.HasOne(e => e.Character)
                      .WithMany(c => c.Comments)
                      .HasForeignKey(e => e.CharacterId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Author)
                      .WithMany(u => u.Comments)
                      .HasForeignKey(e => e.AuthorId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }

        private static void ConfigureCharacterClass(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<CharacterClass>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(20).IsRequired();
                entity.Property(e => e.Description).IsRequired();
                entity.Property(e => e.IconUrl).HasMaxLength(255);

                entity.HasIndex(e => e.Name).IsUnique();
            });
        }

        private static void ConfigureEquipmentSlot(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<EquipmentSlot>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(30).IsRequired();
                entity.Property(e => e.DisplayOrder).IsRequired();

                entity.HasIndex(e => e.Name).IsUnique();
            });
        }
    }
}

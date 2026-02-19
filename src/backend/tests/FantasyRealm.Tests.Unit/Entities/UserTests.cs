using FantasyRealm.Domain.Entities;
using FantasyRealm.Domain.Exceptions;
using Xunit;

namespace FantasyRealm.Tests.Unit.Entities
{
    public class UserTests
    {
        private static Role CreateRole(int id = 1, string label = "User") =>
            new() { Id = id, Label = label };

        [Fact]
        public void Suspend_WhenNotSuspended_SetsIsSuspendedTrue()
        {
            var user = new User { IsSuspended = false };

            user.Suspend();

            Assert.True(user.IsSuspended);
        }

        [Fact]
        public void Suspend_WhenAlreadySuspended_ThrowsDomainException()
        {
            var user = new User { IsSuspended = true };

            var ex = Assert.Throws<DomainException>(() => user.Suspend());
            Assert.Equal("Ce compte est déjà suspendu.", ex.Message);
        }

        [Fact]
        public void Reactivate_WhenSuspended_SetsIsSuspendedFalse()
        {
            var user = new User { IsSuspended = true };

            user.Reactivate();

            Assert.False(user.IsSuspended);
        }

        [Fact]
        public void Reactivate_WhenNotSuspended_ThrowsDomainException()
        {
            var user = new User { IsSuspended = false };

            var ex = Assert.Throws<DomainException>(() => user.Reactivate());
            Assert.Equal("Ce compte n'est pas suspendu.", ex.Message);
        }

        [Fact]
        public void SetTemporaryPassword_SetsHashAndMustChangePassword()
        {
            var user = new User { PasswordHash = "old-hash", MustChangePassword = false };

            user.SetTemporaryPassword("new-temp-hash");

            Assert.Equal("new-temp-hash", user.PasswordHash);
            Assert.True(user.MustChangePassword);
        }

        [Fact]
        public void ChangePassword_SetsHashAndClearsMustChangePassword()
        {
            var user = new User { PasswordHash = "old-hash", MustChangePassword = true };

            user.ChangePassword("new-hash");

            Assert.Equal("new-hash", user.PasswordHash);
            Assert.False(user.MustChangePassword);
        }

        [Fact]
        public void CreateUser_ReturnsCorrectlyInitializedUser()
        {
            var role = CreateRole(1, "User");

            var user = User.CreateUser("test@example.com", "testpseudo", "hashed", role);

            Assert.Equal("test@example.com", user.Email);
            Assert.Equal("testpseudo", user.Pseudo);
            Assert.Equal("hashed", user.PasswordHash);
            Assert.Equal(1, user.RoleId);
            Assert.Same(role, user.Role);
            Assert.False(user.IsSuspended);
            Assert.False(user.MustChangePassword);
        }

        [Fact]
        public void CreateEmployee_ReturnsCorrectlyInitializedUser()
        {
            var role = CreateRole(2, "Employee");

            var user = User.CreateEmployee("emp@example.com", "emppseudo", "hashed", role);

            Assert.Equal("emp@example.com", user.Email);
            Assert.Equal("emppseudo", user.Pseudo);
            Assert.Equal("hashed", user.PasswordHash);
            Assert.Equal(2, user.RoleId);
            Assert.Same(role, user.Role);
            Assert.False(user.IsSuspended);
            Assert.False(user.MustChangePassword);
        }
    }
}

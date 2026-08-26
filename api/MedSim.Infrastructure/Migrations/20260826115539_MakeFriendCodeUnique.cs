using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MedSim.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MakeFriendCodeUnique : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Users_FriendCode",
                table: "Users",
                column: "FriendCode",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_FriendCode",
                table: "Users");
        }
    }
}

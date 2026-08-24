using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MedSim.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTusQuestionIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_TusQuestions_IsClassic_IsApproved_Subject",
                table: "TusQuestions",
                columns: new[] { "IsClassic", "IsApproved", "Subject" });

            migrationBuilder.CreateIndex(
                name: "IX_TusQuestions_Subject",
                table: "TusQuestions",
                column: "Subject");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TusQuestions_IsClassic_IsApproved_Subject",
                table: "TusQuestions");

            migrationBuilder.DropIndex(
                name: "IX_TusQuestions_Subject",
                table: "TusQuestions");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MedSim.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDifficultyFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Difficulty",
                table: "TusQuestions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DifficultyReason",
                table: "TusQuestions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "DifficultyScore",
                table: "TusQuestions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Difficulty",
                table: "MedicalCases",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DifficultyReason",
                table: "MedicalCases",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "DifficultyScore",
                table: "MedicalCases",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Difficulty",
                table: "TusQuestions");

            migrationBuilder.DropColumn(
                name: "DifficultyReason",
                table: "TusQuestions");

            migrationBuilder.DropColumn(
                name: "DifficultyScore",
                table: "TusQuestions");

            migrationBuilder.DropColumn(
                name: "Difficulty",
                table: "MedicalCases");

            migrationBuilder.DropColumn(
                name: "DifficultyReason",
                table: "MedicalCases");

            migrationBuilder.DropColumn(
                name: "DifficultyScore",
                table: "MedicalCases");
        }
    }
}

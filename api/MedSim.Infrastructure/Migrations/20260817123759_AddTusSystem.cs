using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MedSim.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTusSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TusQuestions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    QuestionText = table.Column<string>(type: "text", nullable: false),
                    OptionA = table.Column<string>(type: "text", nullable: false),
                    OptionB = table.Column<string>(type: "text", nullable: false),
                    OptionC = table.Column<string>(type: "text", nullable: false),
                    OptionD = table.Column<string>(type: "text", nullable: false),
                    OptionE = table.Column<string>(type: "text", nullable: false),
                    CorrectOption = table.Column<string>(type: "text", nullable: false),
                    Explanation = table.Column<string>(type: "text", nullable: false),
                    Category = table.Column<string>(type: "text", nullable: false),
                    Subject = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TusQuestions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TusSolvedQuestions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    TusQuestionId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsCorrect = table.Column<bool>(type: "boolean", nullable: false),
                    SolvedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TusSolvedQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TusSolvedQuestions_TusQuestions_TusQuestionId",
                        column: x => x.TusQuestionId,
                        principalTable: "TusQuestions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TusSolvedQuestions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TusSolvedQuestions_TusQuestionId",
                table: "TusSolvedQuestions",
                column: "TusQuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_TusSolvedQuestions_UserId",
                table: "TusSolvedQuestions",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TusSolvedQuestions");

            migrationBuilder.DropTable(
                name: "TusQuestions");
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MedSim.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTusClassicSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsApproved",
                table: "TusQuestions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsClassic",
                table: "TusQuestions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "TusKnowledgeId",
                table: "TusQuestions",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "TusKnowledges",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    KnowledgeText = table.Column<string>(type: "text", nullable: false),
                    Subject = table.Column<string>(type: "text", nullable: false),
                    DepartmentId = table.Column<Guid>(type: "uuid", nullable: true),
                    SubTopicId = table.Column<Guid>(type: "uuid", nullable: true),
                    ImportanceScore = table.Column<int>(type: "integer", nullable: false),
                    RepetitionFrequency = table.Column<string>(type: "text", nullable: false),
                    Sources = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TusKnowledges", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TusKnowledges_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_TusKnowledges_SubTopics_SubTopicId",
                        column: x => x.SubTopicId,
                        principalTable: "SubTopics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "TusKnowledgeProgresses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    TusKnowledgeId = table.Column<Guid>(type: "uuid", nullable: false),
                    Views = table.Column<int>(type: "integer", nullable: false),
                    CorrectCount = table.Column<int>(type: "integer", nullable: false),
                    WrongCount = table.Column<int>(type: "integer", nullable: false),
                    NextReviewAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IntervalDays = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TusKnowledgeProgresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TusKnowledgeProgresses_TusKnowledges_TusKnowledgeId",
                        column: x => x.TusKnowledgeId,
                        principalTable: "TusKnowledges",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TusKnowledgeProgresses_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TusQuestions_TusKnowledgeId",
                table: "TusQuestions",
                column: "TusKnowledgeId");

            migrationBuilder.CreateIndex(
                name: "IX_TusKnowledgeProgresses_TusKnowledgeId",
                table: "TusKnowledgeProgresses",
                column: "TusKnowledgeId");

            migrationBuilder.CreateIndex(
                name: "IX_TusKnowledgeProgresses_UserId_TusKnowledgeId",
                table: "TusKnowledgeProgresses",
                columns: new[] { "UserId", "TusKnowledgeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TusKnowledges_DepartmentId",
                table: "TusKnowledges",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_TusKnowledges_SubTopicId",
                table: "TusKnowledges",
                column: "SubTopicId");

            migrationBuilder.AddForeignKey(
                name: "FK_TusQuestions_TusKnowledges_TusKnowledgeId",
                table: "TusQuestions",
                column: "TusKnowledgeId",
                principalTable: "TusKnowledges",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TusQuestions_TusKnowledges_TusKnowledgeId",
                table: "TusQuestions");

            migrationBuilder.DropTable(
                name: "TusKnowledgeProgresses");

            migrationBuilder.DropTable(
                name: "TusKnowledges");

            migrationBuilder.DropIndex(
                name: "IX_TusQuestions_TusKnowledgeId",
                table: "TusQuestions");

            migrationBuilder.DropColumn(
                name: "IsApproved",
                table: "TusQuestions");

            migrationBuilder.DropColumn(
                name: "IsClassic",
                table: "TusQuestions");

            migrationBuilder.DropColumn(
                name: "TusKnowledgeId",
                table: "TusQuestions");
        }
    }
}

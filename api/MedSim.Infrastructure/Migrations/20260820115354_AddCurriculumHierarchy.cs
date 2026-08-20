using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MedSim.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCurriculumHierarchy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "DepartmentId",
                table: "TusQuestions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SubTopicId",
                table: "TusQuestions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SubTopicId",
                table: "MedicalCases",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Topics",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DepartmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Topics", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Topics_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SubTopics",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TopicId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubTopics", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubTopics_Topics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "Topics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TusQuestions_DepartmentId",
                table: "TusQuestions",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_TusQuestions_SubTopicId",
                table: "TusQuestions",
                column: "SubTopicId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalCases_SubTopicId",
                table: "MedicalCases",
                column: "SubTopicId");

            migrationBuilder.CreateIndex(
                name: "IX_SubTopics_TopicId",
                table: "SubTopics",
                column: "TopicId");

            migrationBuilder.CreateIndex(
                name: "IX_Topics_DepartmentId",
                table: "Topics",
                column: "DepartmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_MedicalCases_SubTopics_SubTopicId",
                table: "MedicalCases",
                column: "SubTopicId",
                principalTable: "SubTopics",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_TusQuestions_Departments_DepartmentId",
                table: "TusQuestions",
                column: "DepartmentId",
                principalTable: "Departments",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TusQuestions_SubTopics_SubTopicId",
                table: "TusQuestions",
                column: "SubTopicId",
                principalTable: "SubTopics",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MedicalCases_SubTopics_SubTopicId",
                table: "MedicalCases");

            migrationBuilder.DropForeignKey(
                name: "FK_TusQuestions_Departments_DepartmentId",
                table: "TusQuestions");

            migrationBuilder.DropForeignKey(
                name: "FK_TusQuestions_SubTopics_SubTopicId",
                table: "TusQuestions");

            migrationBuilder.DropTable(
                name: "SubTopics");

            migrationBuilder.DropTable(
                name: "Topics");

            migrationBuilder.DropIndex(
                name: "IX_TusQuestions_DepartmentId",
                table: "TusQuestions");

            migrationBuilder.DropIndex(
                name: "IX_TusQuestions_SubTopicId",
                table: "TusQuestions");

            migrationBuilder.DropIndex(
                name: "IX_MedicalCases_SubTopicId",
                table: "MedicalCases");

            migrationBuilder.DropColumn(
                name: "DepartmentId",
                table: "TusQuestions");

            migrationBuilder.DropColumn(
                name: "SubTopicId",
                table: "TusQuestions");

            migrationBuilder.DropColumn(
                name: "SubTopicId",
                table: "MedicalCases");
        }
    }
}

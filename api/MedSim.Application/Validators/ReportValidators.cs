using FluentValidation;
using MedSim.Application.DTOs;

namespace MedSim.Application.Validators;

public class CreateReportRequestValidator : AbstractValidator<CreateReportRequest>
{
    public CreateReportRequestValidator()
    {
        RuleFor(x => x.ContentId)
            .NotEmpty().WithMessage("İçerik ID zorunludur.");

        RuleFor(x => x.ContentType)
            .NotEmpty().WithMessage("İçerik tipi zorunludur.")
            .Matches("^(MedicalCase|TusQuestion)$").WithMessage("Geçersiz içerik tipi.");

        RuleFor(x => x.ReportType)
            .NotEmpty().WithMessage("Şikayet türü zorunludur.");
    }
}

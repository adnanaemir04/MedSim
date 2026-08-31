using FluentValidation;
using MedSim.Application.DTOs;

namespace MedSim.Application.Validators;

public class GenerateCaseRequestValidator : AbstractValidator<GenerateCaseRequest>
{
    public GenerateCaseRequestValidator()
    {
        RuleFor(x => x.DepartmentName)
            .NotEmpty().WithMessage("Klinik branş seçimi zorunludur.");

        RuleFor(x => x.TopicName)
            .NotEmpty().WithMessage("Konu seçimi zorunludur.");

        RuleFor(x => x.Count)
            .InclusiveBetween(1, 10).WithMessage("Vaka sayısı 1 ile 10 arasında olmalıdır.");

        RuleFor(x => x.Difficulty)
            .Matches("^(Kolay|Orta|Zor)$").WithMessage("Zorluk seviyesi 'Kolay', 'Orta' veya 'Zor' olmalıdır.");
    }
}

using FluentValidation;
using MedSim.Application.DTOs;

namespace MedSim.Application.Validators;

public class CreateFeedbackDtoValidator : AbstractValidator<CreateFeedbackDto>
{
    public CreateFeedbackDtoValidator()
    {
        RuleFor(x => x.Message)
            .NotEmpty().WithMessage("Mesaj boş olamaz.")
            .MaximumLength(2000).WithMessage("Mesaj maksimum 2000 karakter olabilir.");

        RuleFor(x => x.Teaching)
            .InclusiveBetween(0, 5).WithMessage("Puan 0 ile 5 arasında olmalıdır.");
        RuleFor(x => x.Usability)
            .InclusiveBetween(0, 5).WithMessage("Puan 0 ile 5 arasında olmalıdır.");
        RuleFor(x => x.EaseOfUse)
            .InclusiveBetween(0, 5).WithMessage("Puan 0 ile 5 arasında olmalıdır.");
        RuleFor(x => x.RealLife)
            .InclusiveBetween(0, 5).WithMessage("Puan 0 ile 5 arasında olmalıdır.");
        RuleFor(x => x.Analysis)
            .InclusiveBetween(0, 5).WithMessage("Puan 0 ile 5 arasında olmalıdır.");
        RuleFor(x => x.Speed)
            .InclusiveBetween(0, 5).WithMessage("Puan 0 ile 5 arasında olmalıdır.");
        RuleFor(x => x.Detail)
            .InclusiveBetween(0, 5).WithMessage("Puan 0 ile 5 arasında olmalıdır.");
    }
}

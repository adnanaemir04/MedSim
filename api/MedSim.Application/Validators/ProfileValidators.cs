using FluentValidation;
using MedSim.Application.DTOs;

namespace MedSim.Application.Validators;

public class UpdateProfileDtoValidator : AbstractValidator<UpdateProfileDto>
{
    public UpdateProfileDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("E-posta adresi zorunludur.")
            .EmailAddress().WithMessage("Geçersiz e-posta formatı.");

        RuleFor(x => x.Nickname)
            .NotEmpty().WithMessage("Kullanıcı adı zorunludur.")
            .MinimumLength(3).WithMessage("Kullanıcı adı en az 3 karakter olmalıdır.")
            .MaximumLength(50).WithMessage("Kullanıcı adı en fazla 50 karakter olmalıdır.");
            
        RuleFor(x => x.Points)
            .GreaterThanOrEqualTo(0).WithMessage("Puan 0'dan küçük olamaz.")
            .When(x => x.Points.HasValue);
    }
}

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
            .NotEmpty().WithMessage("Kullanıcı adı (nickname) zorunludur.")
            .Length(3, 50).WithMessage("Kullanıcı adı en az 3, en fazla 50 karakter olmalıdır.");
    }
}

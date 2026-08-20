using FluentValidation;
using MedSim.Application.DTOs;

namespace MedSim.Application.Validators;

public class CreateAdminDtoValidator : AbstractValidator<CreateAdminDto>
{
    public CreateAdminDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("E-posta adresi zorunludur.")
            .EmailAddress().WithMessage("Geçersiz e-posta formatı.");

        RuleFor(x => x.Nickname)
            .NotEmpty().WithMessage("Kullanıcı adı (nickname) zorunludur.")
            .MinimumLength(3).WithMessage("Kullanıcı adı en az 3 karakter olmalıdır.")
            .MaximumLength(50).WithMessage("Kullanıcı adı en fazla 50 karakter olmalıdır.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Şifre zorunludur.")
            .MinimumLength(6).WithMessage("Şifre en az 6 karakter olmalıdır.");
    }
}

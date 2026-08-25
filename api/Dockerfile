# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files and restore dependencies
COPY ["MedSim.Api/MedSim.Api.csproj", "MedSim.Api/"]
COPY ["MedSim.Application/MedSim.Application.csproj", "MedSim.Application/"]
COPY ["MedSim.Domain/MedSim.Domain.csproj", "MedSim.Domain/"]
COPY ["MedSim.Infrastructure/MedSim.Infrastructure.csproj", "MedSim.Infrastructure/"]
RUN dotnet restore "MedSim.Api/MedSim.Api.csproj"

# Copy the rest of the code and build
COPY . .
WORKDIR "/src/MedSim.Api"
RUN dotnet build "MedSim.Api.csproj" -c Release -o /app/build

# Stage 2: Publish
FROM build AS publish
RUN dotnet publish "MedSim.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 80
EXPOSE 8080

COPY --from=publish /app/publish .

# Define entrypoint
ENTRYPOINT ["dotnet", "MedSim.Api.dll"]

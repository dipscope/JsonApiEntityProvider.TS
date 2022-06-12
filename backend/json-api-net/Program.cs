using JsonApiDotNetCore.Configuration;
using JsonApiNet;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>();
builder.Services.AddJsonApi<AppDbContext>();
builder.Services.AddControllers();

var app = builder.Build();

app.UseRouting();
app.UseJsonApi();
app.MapControllers();

static async Task CreateDatabaseAsync(IServiceProvider serviceProvider)
{
    await using AsyncServiceScope scope = serviceProvider.CreateAsyncScope();

    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    await dbContext.Database.EnsureCreatedAsync();

    if (!dbContext.Companies.Any())
    {
        dbContext.Companies.Add(new Company() 
        { 
            Name = "Great" 
        });

        dbContext.Companies.Add(new Company() 
        { 
            Name = "Smart" 
        });

        await dbContext.SaveChangesAsync();
    }

    if (!dbContext.UserStatuses.Any())
    {
        dbContext.UserStatuses.Add(new UserStatus() 
        { 
            Name = "Active" 
        });

        dbContext.UserStatuses.Add(new UserStatus() 
        { 
            Name = "Blocked" 
        });

        await dbContext.SaveChangesAsync();
    }

    if (!dbContext.Users.Any())
    {
        dbContext.Users.Add(new User()
        {
            Name = "Dmitry",
            Position = 1,
            UserStatusId = dbContext.UserStatuses.First(us => us.Name == "Active").Id,
            CompanyId = dbContext.Companies.First(us => us.Name == "Great").Id
        });

        dbContext.Users.Add(new User()
        {
            Name = "Alex",
            Position = 2,
            UserStatusId = dbContext.UserStatuses.First(us => us.Name == "Blocked").Id,
            CompanyId = dbContext.Companies.First(us => us.Name == "Smart").Id
        });

        dbContext.Users.Add(new User()
        {
            Name = "Victor",
            Position = 3,
            UserStatusId = dbContext.UserStatuses.First(us => us.Name == "Active").Id,
            CompanyId = dbContext.Companies.First(us => us.Name == "Smart").Id
        });

        await dbContext.SaveChangesAsync();
    }

    if (!dbContext.Messages.Any())
    {
        dbContext.Messages.Add(new Message()
        {
            Text = "Hi Dmitry!",
            UserId = dbContext.Users.First(u => u.Name == "Dmitry").Id
        });

        dbContext.Messages.Add(new Message()
        {
            Text = "How are you?",
            UserId = dbContext.Users.First(u => u.Name == "Dmitry").Id
        });

        dbContext.Messages.Add(new Message()
        {
            Text = "Got a minute?",
            UserId = dbContext.Users.First(u => u.Name == "Dmitry").Id
        });

        dbContext.Messages.Add(new Message()
        {
            Text = "Hi Alex!",
            UserId = dbContext.Users.First(u => u.Name == "Alex").Id
        });

        dbContext.Messages.Add(new Message()
        {
            Text = "How is it going?",
            UserId = dbContext.Users.First(u => u.Name == "Alex").Id
        });

        await dbContext.SaveChangesAsync();
    }

    return;
}

await CreateDatabaseAsync(app.Services);

app.Run();

using JsonApiDotNetCore.Configuration;
using JsonApiNet;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>();
builder.Services.AddJsonApi<AppDbContext>(o => o.IncludeTotalResourceCount = true);
builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy.WithOrigins("*").AllowAnyHeader().AllowAnyMethod()));
builder.Services.AddControllers();

var app = builder.Build();

app.UseRouting();
app.UseJsonApi();
app.UseCors();
app.MapControllers();

static async Task CreateDatabaseAsync(IServiceProvider serviceProvider)
{
    await using AsyncServiceScope scope = serviceProvider.CreateAsyncScope();

    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    await dbContext.Database.EnsureCreatedAsync();

    foreach (var company in dbContext.Companies)
    {
        dbContext.Companies.Remove(company);
    }

    foreach (var userStatus in dbContext.UserStatuses)
    {
        dbContext.UserStatuses.Remove(userStatus);
    }

    foreach (var user in dbContext.Users)
    {
        dbContext.Users.Remove(user);
    }

    foreach (var message in dbContext.Messages)
    {
        dbContext.Messages.Remove(message);
    }

    dbContext.SaveChanges();

    dbContext.Companies.Add(new Company() 
    { 
        Name = "Great" 
    });

    dbContext.Companies.Add(new Company() 
    { 
        Name = "Smart" 
    });

    await dbContext.SaveChangesAsync();
    
    dbContext.UserStatuses.Add(new UserStatus() 
    { 
        Name = "Active" 
    });

    dbContext.UserStatuses.Add(new UserStatus() 
    { 
        Name = "Blocked" 
    });

    await dbContext.SaveChangesAsync();
    
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

    return;
}

await CreateDatabaseAsync(app.Services);

app.Run();

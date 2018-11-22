
## O.S. agnostic
The following tutorial is O.S. agnostic. In the following tutorial we will use different stuff.


## Requirements
Please note that in order to proceed with the following tutorial you should have the following tools installed on your machine:


# Setup lambda solution

1) First of all, let's create the folder of our project. In that case, we will call it HandsOnLambda:

```
mkdir HandsOnLambda
cd HandsOnLambda
dotnet add new 
```
2) Create our solution inside the HandsOnLambda folder:

```
dotnet new sln -n HandsOnLambda 
```
3) Create some sub-folders for source and test projects:
```
mkdir src
mkdir tests
```
4) Create the lambda project inside the src folder:
```
cd src
dotnet new web -n HandsOnLambda.Functions
dotnet new classlib -n HandsOnLambda.Domain
```

5) Add the projects to our solution by using:

```
dotnet sln HandsOnLambda.sln  add ./src/HandsOnLambda.Domain/HandsOnLambda.Domain.csproj 
dotnet sln HandsOnLambda.sln  add ./src/HandsOnLambda.Functions/HandsOnLambda.Functions.csproj 
```

6) Add a test project to our solution into the tests folder by using

```
dotnet new xunit -n HandsOnLambda.Domain.Tests
dotnet sln HandsOnLambda.sln  add ./tests/HandsOnLambda.Domain.Tests/HandsOnLambda.Domain.Tests.csproj 
```


Finally, we should have a file system structure almost similar to this one:

```
.
├── HandsOnLambda.sln
├── README.MD
├── src
│   ├── HandsOnLambda.Domain
│   │   ├── Class1.cs
│   │   ├── HandsOnLambda.Domain.csproj
│   └── HandsOnLambda.Functions
│       ├── HandsOnLambda.Functions.csproj
│       ├── Program.cs
│       ├── Startup.cs
└── tests
    └── HandsOnLambda.Domain.Tests
        ├── HandsOnLambda.Domain.Tests.csproj
        ├── UnitTest1.cs
```

## Setting up serverless
Serverless provides a way to improve the solution [INSERISCI_I_MOTIVI]

In order to start with serverless let's start by executing the following command in our CLI:


## Overview on solution

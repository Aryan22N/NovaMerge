1. we have installed the next.js using npx create-next-app@latest
2. we have installed the shadcn/ui using npx shadcn@latest init --preset b6GMM7ajb --template next --pointer 
(we can find the shadcn configuration in the components.json file)
3. using (npx shadcn@latest add) to install all the components we want 
4. using this we are going to add dark/light mode (npm install next-themes)
5. Making a folder named providers and add the `theme-provider.tsx` file 
(this is a provider that is going to provide the dark/light mode to the application)
also change in layout add the ThemeProviders given in docs
after this we have implemented the dark-light theme 
6. add one more component add in ui named mode-toggle.tsx
At this point we have successfully added the dark and light mode toggle theme feature
7. Now adding the tanstack Router (npm i @tanstack/react-query) now we have to set up this 
8. make the provider query-provider.tsx 
-----------------------------------------------------------------------------------
9. Spinning up database (Neon-postgress) ans add the database_url in .env 
10. Now we will gona set up postgress
(npm install prisma @types/pg --save-dev)
(npm install @prisma/client @prisma/adapter-pg pg dotenv)
Now we will set up some basic things 
11. npx prisma init  
This will create a prisma folder with a schema.prisma file and a prisma.config.ts file 
12. in lib add the db.ts file 
(import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
}

function createPrismaClient(){
    const url=process.env.DATABASE_URL;
    if(!url) throw new Error("Please provide the DATABASE_URL in .env file"); 

    const adapter=new PrismaPg({connectionString:url});
    return new PrismaClient({adapter});
}

export const prisma=globalForPrisma.prisma ?? createPrismaClient();

if(process.env.NODE_ENV!=="production") globalForPrisma.prisma=prisma;
)
13. using npx prisma generate
(This will generate the prisma client)
14. 
For the testing purpose we will make the model in schema.prisma file as this 
model Test{
id String @id @default(cuid())
title String
}
15. by using (npx prisma migrate dev) we can create the model in the database 
this will create the model in the database 
by using (npx prisma generate) this will generate the prisma client

we have sucessfully set up db 
----------------------------------------------------------------------------------
Now we are going to set up Better Auth
using (npm install better-auth) add better_auth_secret and better_auth_url in .env file
16. In lin make the file named auth.ts
17. using(npx auth@latest generate) to generate all the schemas for auth 
using npx prisma generate and npx prisma migrate dev to migrate all the tables of auth
18. Now make the folder in app api/auth/[...all]/route.ts
19. In gitHub in settings in Developer settings in OAuth apps add the github app
In app we made the folder (auth) in that another folder sign-in with file page.tsx
20. make another folder in root named features inside it another 3 folder one is auth ,ai,github
in components add file named github-sign-in-form.tsx 
in action add index.ts
21. make the utils folder in features/auth also one file index.ts here This utility ensures all login redirects in your Server Actions and client components are internal-only and safe, keeping user authentication secure.

Besically we are making the flow like if the user is authenticated it should move to dashboard but if not then it should move to login page , if user expelicitely type /sign-in and user is authenticated then it should move to dashboard 

22. Making proxy.ts file in the root 
23. again make one utility function named auth-proxt.ts 
24. make the file user-menu 
D:\Final Projects\Nova_Merge\pr_reviewer\features\auth\components\user-menu.tsx
Whenever you need a user profile menu or sign-out button in headers or sidebars, you simply render <UserMenuWithSession />.

Till Now we have completed the auuth Flow
----------------------------------------------------------------------------------

25. making the ui of dashboard

Making of UI dashboard using Shadcn ui 
-----------------------------------------------------------------------------------
26. Making the GitHub app , For Repo Fetching 
    Come in  developer setting in github and 
But Before we are going to set up ngrok 

ngrok http 3000 --domain=manhole-ducking-retread.ngrok-free.dev --host-header=rewrite

After doing this operations 
we need to install the package called (npm i octokit)
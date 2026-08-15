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
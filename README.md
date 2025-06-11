# 📝 Task Management App

A full-stack **Kanban-style task management** tool built with the modern **T3 Stack** (Next.js, TypeScript, Tailwind CSS, tRPC, Prisma, Supabase, and NextAuth). Designed for collaboration, simplicity, and scalability.

---

## 🚀 Features

- ✅ User Authentication via Email (Magic Link)
- 🧑‍🤝‍🧑 Assign users to tasks
- 📁 Create & manage multiple projects
- 🗂 Kanban board with drag-and-drop tasks (Todo, In-Progress, Done)
- 📝 Full task CRUD (Create, Read, Update, Delete)
- 🎯 Set task priority & due date
- 🧑‍💻 User Profile management
- 🧪 Unit & Integration Testing
- 🌐 Deployed on Vercel

---

## 🧑‍💻 Tech Stack

| Frontend         | Backend        | Auth & DB         | Tooling & DX              |
|------------------|----------------|-------------------|---------------------------|
| React (Next.js)  | tRPC + Zod     | NextAuth + Supabase | TypeScript, Jest, ESLint  |
| Tailwind CSS     | Prisma ORM     | PostgreSQL        | @dnd-kit for drag & drop  |

---

## 📁 Project Structure

task-management-app/
├── prisma/ # Prisma DB schema
├── public/ # Static assets
├── src/
│ ├── components/ # Reusable UI components
│ ├── pages/ # App routes (Next.js)
│ ├── server/
│ │ ├── api/ # tRPC routers
│ │ ├── auth.ts # NextAuth config
│ │ └── db.ts # Prisma client
│ └── styles/ # TailwindCSS styles
├── .env # Environment variables
├── jest.config.ts # Jest test config
├── tsconfig.json # TypeScript config
├── next.config.js # Next.js config
└── README.md


---

## 🧪 Local Setup

### 1. Clone & Install

```bash
git clone https://github.com/your-username/task-management-app.git
cd task-management-app
npm install

2. Configure Environment
Create a .env file based on the example below:

DATABASE_URL=your_supabase_postgres_url
NEXTAUTH_SECRET=some-random-secret
NEXTAUTH_URL=http://localhost:3000

EMAIL_SERVER_HOST=smtp.ethereal.email
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your_user
EMAIL_SERVER_PASSWORD=your_pass
EMAIL_FROM=you@example.com

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

3. Setup Prisma

npx prisma db push
npm run db:generate

4. Run App

npm run dev

🧪 Testing

npm test

Covers:

Task creation/editing

User assignment

Project management

Drag-and-drop logic

User profile updates

☁️ Deployment
✅ Live on Vercel
To deploy:

    1. Push your repo to GitHub.

    2. Connect it to Vercel.

    3. Set environment variables in the Vercel dashboard.

    4. Build & deploy.

🔧 Linting & Formatting
npm run lint     # Run ESLint
npx prettier --write .  # Format code


💡 Future Enhancements
 Collaborators per project

 Real-time updates

 Comment threads on tasks

 Dark mode toggle

 Mobile responsiveness polish

🙏 Credits
T3 Stack

tRPC

NextAuth.js

Supabase

Prisma

@dnd-kit

👤 Author
Built with ❤️ by Aryan Verma
LinkedIn





import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { api } from "@/utils/api";
import { CreateProjectForm } from "@/components/CreateProjectForm";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [editing, setEditing] = useState<null | { id: string; name: string; description?: string }>(null);

  const { data: projects, isLoading: isLoadingProjects } =
    api.project.getProjects.useQuery(undefined, {
      enabled: !!session,
    });

  const utils = api.useUtils();
  const deleteProject = api.project.deleteProject.useMutation({
    onSuccess: () => utils.project.getProjects.invalidate(),
  });

  const updateProject = api.project.updateProject.useMutation({
    onSuccess: () => {
      utils.project.getProjects.invalidate();
      setEditing(null);
    },
  });

  useEffect(() => {
    if (session && !isLoadingProjects && projects?.length === 0) {
      router.push("/create");
    }
  }, [session, isLoadingProjects, projects, router]);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProject.mutate({ id });
    }
  };




  return (
    <div className="bg-gray-100 min-h-screen">
      <Head>
        <title>Task Management App</title>
        <meta name="description" content="Create and manage your projects" />
      </Head>
      {session && <div className="flex justify-between gap-4 mt-2 mr-2 ml-2">
        <Link
          href="/create"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Create Project
        </Link>
        <Link
          href="/profile"
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Profile
        </Link>
      </div>}
      <main className="min-h-screen  flex flex-col items-center justify-center p-8">

        {status === "unauthenticated" && (
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h1 className="text-4xl font-bold text-gray-800">Welcome to TaskMate 🚀</h1>
            <p className="text-gray-600 text-lg">
              Create projects, manage tasks with deadlines, priorities, team assignments, and track progress visually using Kanban drag-and-drop.
            </p>

            <ul className="text-left list-disc list-inside text-gray-700 text-base">
              <li>Create and organize multiple projects</li>
              <li>Assign tasks to teammates</li>
              <li>Set priorities and due dates</li>
              <li>Edit, delete, and reorder tasks visually</li>
              <li>Fully responsive & intuitive UI</li>
            </ul>

            <button
              onClick={() => signIn("email", { callbackUrl: "/" })}
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 mt-4"
            >
              Get Started – Sign in
            </button>
          </div>
        )}

        {status === "loading" && <p>Loading session...</p>}

        {session && !isLoadingProjects && projects?.length === 0 && (
          <div className="max-w-xl mx-auto mt-8 space-y-6">
            <h2 className="text-2xl font-bold text-center">Create Your First Project</h2>
            <CreateProjectForm />

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">Signed in as <strong>{session.user.name}</strong></p>
              <button
                onClick={() => signOut()}
                className="text-red-600 hover:underline mt-2"
              >
                Sign out
              </button>
            </div>
          </div>
        )}

        {session && projects && (
          <div className="w-full max-w-lg space-y-6">
            <h2 className="text-2xl font-bold text-center mb-4">Your Projects</h2>


            <ul className="space-y-2">
              {projects.map((project) => (
                <li
                  key={project.id}
                  className="bg-white p-4 rounded shadow flex justify-between items-center"
                >
                  <div className="flex-1">
                    {editing?.id === project.id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          updateProject.mutate({
                            id: editing.id,
                            name: editing.name,
                            description: editing.description,
                          });
                        }}
                        className="flex flex-col gap-2"
                      >
                        <input
                          type="text"
                          value={editing.name}
                          onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                          className="border px-2 py-1"
                        />
                        <textarea
                          value={editing.description ?? ""}
                          onChange={(e) =>
                            setEditing({ ...editing, description: e.target.value })
                          }
                          className="border px-2 py-1"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            type="submit"
                            className="bg-green-600 text-white px-3 py-1 rounded"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditing(null)}
                            className="bg-gray-300 px-3 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <span className="font-medium">{project.name}</span>
                        {project.description && (
                          <p className="text-sm text-gray-500 mb-2">{project.description}</p>
                        )}
                      </>

                    )}
                  </div>

                  <Link
                    href={`/projects/${project.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View Tasks →
                  </Link>

                  <div className="flex gap-2 ml-4">
                    <button
                      className="text-sm text-blue-600 hover:underline"
                      onClick={() =>
                        setEditing({
                          id: project.id,
                          name: project.name,
                          description: project.description || "",
                        })
                      }
                    >
                      Edit
                    </button>
                    <button
                      className="text-sm text-red-600 hover:underline"
                      onClick={() => handleDelete(project.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {!session.user.name && (
              <div className="text-center text-sm text-orange-600 mt-4">
                <Link href="/setup" className="hover:underline font-medium">
                  Complete your profile →
                </Link>
              </div>
            )}

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Signed in as <strong>{session.user.name || session.user.email}</strong>
              </p>
              <button
                onClick={() => signOut()}
                className="text-red-600 hover:underline mt-2"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
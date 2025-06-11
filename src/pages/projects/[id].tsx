import Head from "next/head";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { TaskBoard } from "@/components/TaskBoard";
import Link from "next/link";

export default function ProjectDetailPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const projectId = router.query.id as string;

    const { data: projectList = [] } = api.project.getProjects.useQuery();
    const project = projectList.find((p) => p.id === projectId);

    if (status === "loading") return <p>Loading session...</p>;
    if (!session) {
        void router.push("/auth/signin");
        return null;
    }

    return (
        <>
            <Head>
                <title>{project?.name ?? "Project"} | Tasks</title>
            </Head>
            <main className="min-h-screen p-8 bg-gray-100 ">
                <div className="sticky top-6 z-20">
                <Link
                    href="/"
                    className="inline-block bg-gray-200 px-4 py-1 rounded hover:bg-gray-300 text-sm mb-4"
                >
                    ← 
                </Link>
                </div>

                <h1 className="text-2xl font-bold mb-6">Project: {project?.name}</h1>
                <TaskBoard projectId={projectId} />
            </main>
        </>
    );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Code2, GraduationCap, Star } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const teamMembers = [
  {
    initials: "MA",
    name: "Muhammad Abdullah Hussain",
    role: "Full Stack Developer",
    accent: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400",
    ring: "ring-emerald-100 dark:ring-emerald-900/50",
  },
  {
    initials: "SA",
    name: "Syed Muhammad Ali Zaidi",
    role: "Full Stack + Documentation",
    accent: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-400",
    ring: "ring-blue-100 dark:ring-blue-900/50",
  },
  {
    initials: "RD",
    name: "Rana Danish Kareem",
    role: "Documentation + Frontend",
    accent: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400",
    ring: "ring-rose-100 dark:ring-rose-900/50",
  },
  {
    initials: "RA",
    name: "Razib Ahmed Malik",
    role: "Frontend Developer",
    accent: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-400",
    ring: "ring-violet-100 dark:ring-violet-900/50",
  },
];

const techStack = [
  { label: "Next.js", className: "bg-slate-100 text-slate-800 dark:bg-slate-800/50 dark:text-slate-300" },
  { label: "FastAPI", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" },
  { label: "OpenCV", className: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400" },
  { label: "Tailwind", className: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-400" },
  { label: "Python", className: "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400" },
  { label: "Docker", className: "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400" },
  { label: "Railway", className: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400" },
  { label: "Vercel", className: "bg-neutral-100 text-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-300" },
];

function TeamMemberCard({
  member,
  index,
}: {
  member: (typeof teamMembers)[number];
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
      className="premium-card flex flex-col items-center px-5 py-8 text-center"
    >
      <div
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-full bg-muted text-lg font-semibold text-muted-foreground ring-4",
          member.ring,
        )}
      >
        {member.initials}
      </div>
      <h3 className="mt-5 text-sm font-semibold leading-snug sm:text-base">
        {member.name}
      </h3>
      <span
        className={cn(
          "mt-4 inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide sm:text-[11px]",
          member.accent,
        )}
      >
        {member.role}
      </span>
    </motion.article>
  );
}

export function TeamSection() {
  return (
    <section id="team" className="border-t border-border bg-muted/30 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            The Team
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Meet the{" "}
            <span className="bg-gradient-to-r from-brand to-amber-500 bg-clip-text text-transparent">
              Team Behind
            </span>{" "}
            ReColNet
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Four passionate computer science students united by a vision to
            revolutionize medical imaging through AI-powered pseudo-colorization,
            under the guidance of our supervisor Dr. Syed Safdar Hussain.
          </p>
        </div>

        {/* Team grid */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member, i) => (
            <TeamMemberCard key={member.initials} member={member} index={i} />
          ))}
        </div>

        {/* Supervisor + Built With */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Supervisor */}
          <motion.article
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="premium-card flex flex-col p-6 sm:p-8"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <GraduationCap className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <span className="inline-flex rounded-full border border-brand/20 bg-brand/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
                  Project Supervisor
                </span>
                <h3 className="mt-2 text-lg font-bold sm:text-xl">
                  Dr. Syed Safdar Hussain
                </h3>
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
              An experienced educator and mentor who guided us throughout this
              journey. His invaluable insights, constant support, and expert
              guidance made ReColNet possible.
            </p>
            <p className="mt-5 flex items-start gap-2 text-sm text-brand">
              <Star className="mt-0.5 h-4 w-4 shrink-0 fill-brand" />
              <span>
                With heartfelt gratitude for believing in us and our vision!
              </span>
            </p>
          </motion.article>

          {/* Built With */}
          <motion.article
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="premium-card flex flex-col p-6 sm:p-8"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/5 text-primary dark:bg-primary/10">
                <Code2 className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Built With
                </p>
                <h3 className="mt-1 text-lg font-bold sm:text-xl">
                  Next.js + FastAPI AI
                </h3>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {techStack.map((tag) => (
                <span
                  key={tag.label}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide sm:text-[11px]",
                    tag.className,
                  )}
                >
                  {tag.label}
                </span>
              ))}
            </div>

            <p className="mt-5 flex-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
              A full-stack platform built with Next.js and FastAPI, powered by
              OpenCV DNN for grayscale image and video colorization — with
              SQLite storage, ffmpeg video processing, and cloud deployment on
              Railway and Vercel.
            </p>

            <Link
              href="#features"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-6 w-full rounded-full sm:w-auto",
              )}
            >
              View More About Our Journey
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
